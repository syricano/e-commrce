// StoreProducts.jsx
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/config/axiosConfig';
import { useLang } from '@/context/LangProvider';
import usePageTitle from '@/hooks/usePageTitle';
import StoreNav from '@/components/merchant/StoreNav.jsx';
import { errorHandler } from '@/utils';
import ProductEditModal from '@/components/merchant/ProductEditModal.jsx';
import { slugOf } from '@/utils/categories.js';
import { DEFAULT_FIELDS } from '@/utils/catalogDefaults.js';

export default function StoreProducts() {
  const { id } = useParams();
  usePageTitle('Store Products');
  const storeId = id;
  const { lang, t } = useLang();

  const [categories, setCategories] = useState([]);
  const [catTrs, setCatTrs] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [f, setF] = useState({
    categoryId: '',
    articleNumber: '',
    name: '',
    description: '',
    stockOnHand: '', // total product stock
    basePrice: '',
  });
  const [attr, setAttr] = useState({});
  const [variants, setVariants] = useState([{ size: '', color: '', stock: '' }]);
  const [uploadingId, setUploadingId] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // derived totals
  const totalStock = useMemo(() => Math.max(0, Number(f.stockOnHand || 0)), [f.stockOnHand]);
  const allocatedStock = useMemo(
    () =>
      (variants || []).reduce((sum, r) => {
        const v = Number(r.stock || 0);
        return sum + (Number.isFinite(v) && v > 0 ? v : 0);
      }, 0),
    [variants]
  );
  const remainingStock = Math.max(totalStock - allocatedStock, 0);
  const overAllocated = allocatedStock > totalStock;

  const load = async () => {
    setLoading(true);
    try {
      const [cRes, tRes, pRes] = await Promise.all([
        axiosInstance.get('/categories', { params: { limit: 1000 } }),
        axiosInstance.get('/category-translations', { params: { limit: 5000 } }).catch(() => ({ data: [] })),
        axiosInstance.get('/store-products', { params: { storeId } }),
      ]);
      setCategories(cRes?.data?.items || cRes?.data || []);
      setCatTrs(tRes?.data?.items || tRes?.data || []);
      setItems(pRes?.data || []);
    } catch (e) {
      errorHandler(e, t('Failed to load') || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (storeId) load();
  }, [storeId]);

  const cleanVariants = (rows) =>
    (rows || [])
      .map((r) => ({
        size: String(r.size || '').trim(),
        color: String(r.color || '').trim(),
        stock: Number(r.stock || 0),
      }))
      .filter((r) => (r.size || r.color) && Number.isFinite(r.stock) && r.stock >= 0);

  const onCreate = async () => {
    if (allocatedStock > totalStock) {
      return errorHandler(null, t('Allocated variant stock exceeds product stock'));
    }

    const payload = {
      storeId: Number(storeId),
      categoryId: f.categoryId ? Number(f.categoryId) : null,
      articleNumber: String(f.articleNumber || '').trim(),
      name: String(f.name || '').trim(),
      description: String(f.description || '').trim(),
      stockOnHand: f.stockOnHand === '' ? 0 : Math.max(0, Number(f.stockOnHand) || 0),
      attributes: {
        ...attr,
        ...(f.basePrice !== '' ? { base_price: Math.max(0, Math.round(Number(f.basePrice) || 0)) } : {}),
        variants: cleanVariants(variants),
      },
    };

    // Enforce subcategory when a parent category is selected
    const selected = categories.find((c) => String(c.id) === String(payload.categoryId));
    if (selected) {
      const hasChildren = categories.some((c) => String(c.parentId || '') === String(selected.id));
      if (hasChildren) return errorHandler(null, t('Please select a subcategory'));
    }
    if (!payload.articleNumber || !payload.name) return;

    try {
      await axiosInstance.post('/store-products', payload);
      setF({ categoryId: '', articleNumber: '', name: '', description: '', stockOnHand: '', basePrice: '' });
      setAttr({});
      setVariants([{ size: '', color: '', stock: '' }]);
      await load();
    } catch (e) {
      errorHandler(e, t('Create failed') || 'Create failed');
    }
  };

  const onUpload = async (productId, file) => {
    try {
      setUploadingId(productId);
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const filename = `${Date.now()}_${file.name}`;
      const upRes = await axiosInstance.post('/merchant/upload', { filename, data: base64 });
      const url = upRes?.data?.url;
      if (url) await axiosInstance.post(`/store-products/${productId}/media`, { url });
      await load();
    } catch (e) {
      errorHandler(e, t('Upload failed') || 'Upload failed');
    } finally {
      setUploadingId(null);
    }
  };

  const openEdit = (p) => {
    setEditItem(p);
    setEditOpen(true);
  };
  const closeEdit = () => {
    setEditOpen(false);
    setEditItem(null);
  };

  const handleVariantStockChange = (idx, nextValue) => {
    setVariants((rows) => {
      const out = [...rows];
      const current = Number(out[idx].stock || 0);
      const desired = Math.max(0, Number(nextValue || 0));

      const othersSum = rows.reduce((s, r, i) => (i === idx ? s : s + (Number(r.stock || 0) || 0)), 0);
      const maxForThis = Math.max(totalStock - othersSum, 0);
      out[idx] = { ...out[idx], stock: Math.min(desired, maxForThis) };
      return out;
    });
  };

  const addVariant = () => {
    if (remainingStock <= 0) {
      return errorHandler(null, t('Increase product stock to add more variants'));
    }
    setVariants((rows) => [...rows, { size: '', color: '', stock: '' }]);
  };

  return (
    <section className="p-4 space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">
        {t('Store')} {storeId} — {t('Store Products') || t('Products')}
      </h1>
      <StoreNav />

      <div className="card bg-base-100 border">
        <div className="card-body grid md:grid-cols-2 gap-3">
          <label className="form-control">
            <span className="label-text">{t('SKU') || 'Article Number (SKU)'}</span>
            <input
              className="input input-bordered"
              value={f.articleNumber}
              onChange={(e) => setF((s) => ({ ...s, articleNumber: e.target.value }))}
            />
          </label>

          <label className="form-control">
            <span className="label-text">{t('Name') || 'Name'}</span>
            <input className="input input-bordered" value={f.name} onChange={(e) => setF((s) => ({ ...s, name: e.target.value }))} />
          </label>

          <label className="form-control">
            <span className="label-text">{t('Base Price') || 'Base Price'}</span>
            <input
              className="input input-bordered"
              type="number"
              min="0"
              value={f.basePrice}
              onChange={(e) => setF((s) => ({ ...s, basePrice: e.target.value }))}
            />
          </label>

          <label className="form-control">
            <span className="label-text">{t('Category') || 'Category'}</span>
            <select
              className="select select-bordered"
              value={f.categoryId}
              onChange={(e) => {
                setF((s) => ({ ...s, categoryId: e.target.value }));
                setAttr({});
              }}
            >
              <option value="">{t('None') || '— none —'}</option>
              {categories.map((c) => {
                const pref = (catTrs || []).find((t) => Number(t.categoryId) === Number(c.id) && t.locale === lang);
                const fallback =
                  (catTrs || []).find((t) => Number(t.categoryId) === Number(c.id) && t.locale === 'en') ||
                  (catTrs || []).find((t) => Number(t.categoryId) === Number(c.id));
                const tr = pref || fallback;
                return (
                  <option key={c.id} value={c.id}>
                    {tr?.name || tr?.slug || `#${c.id}`}
                  </option>
                );
              })}
            </select>
          </label>

          {(() => {
            const selected = categories.find((c) => String(c.id) === String(f.categoryId));
            const children = selected ? categories.filter((c) => String(c.parentId || '') === String(selected.id)) : [];
            if (children.length === 0) return null;
            return (
              <label className="form-control">
                <span className="label-text">{t('Subcategory') || 'Subcategory'}</span>
                <select
                  className="select select-bordered"
                  value={''}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v) setF((s) => ({ ...s, categoryId: v }));
                  }}
                >
                  <option value="">{t('Select') || 'Select'}</option>
                  {children.map((ch) => {
                    const tr =
                      (catTrs || []).find(
                        (t) => Number(t.categoryId) === Number(ch.id) && (t.locale === lang || t.locale === 'en')
                      ) || (catTrs || []).find((t) => Number(t.categoryId) === Number(ch.id));
                    return (
                      <option key={ch.id} value={ch.id}>
                        {tr?.name || tr?.slug || `#${ch.id}`}
                      </option>
                    );
                  })}
                </select>
              </label>
            );
          })()}

          {/* Product-level stock */}
          <label className="form-control">
            <span className="label-text">{t('Stock') || 'Stock'}</span>
            <input
              className="input input-bordered"
              type="number"
              min="0"
              value={f.stockOnHand}
              onChange={(e) => setF((s) => ({ ...s, stockOnHand: e.target.value }))}
            />
            <span className="text-xs opacity-70 mt-1">
              {t('Allocated to variants') || 'Allocated to variants'}: {allocatedStock} •{' '}
              {t('Remaining') || 'Remaining'}: {remainingStock}
            </span>
            {overAllocated && (
              <span className="text-xs text-error mt-1">
                {t('Allocated variant stock exceeds product stock')}
              </span>
            )}
          </label>

          <label className="form-control md:col-span-2">
            <span className="label-text">{t('Description') || 'Description'}</span>
            <textarea
              className="textarea textarea-bordered"
              rows={3}
              value={f.description}
              onChange={(e) => setF((s) => ({ ...s, description: e.target.value }))}
            />
          </label>

          {/* Dynamic attributes based on selected category fields */}
          {(() => {
            const cat = categories.find((c) => String(c.id) === String(f.categoryId));
            let fields = cat?.metadata?.filters?.fields || [];
            if (!Array.isArray(fields) || fields.length === 0) {
              const slug = slugOf(cat?.id, catTrs, 'en');
              const key = String(slug || '').replace(/_/g, '-');
              fields = DEFAULT_FIELDS[key] || [];
            }
            return Array.isArray(fields) && fields.length > 0 ? (
              <div className="md:col-span-2 grid md:grid-cols-2 gap-3">
                {fields.map((field) => (
                  <label key={field.key} className="form-control">
                    <span className="label-text">{t(field.label) || field.label || field.key}</span>
                    {field.type === 'select' ? (
                      <select
                        className="select select-bordered"
                        value={attr[field.key] || ''}
                        onChange={(e) => setAttr((s) => ({ ...s, [field.key]: e.target.value }))}
                      >
                        <option value="">—</option>
                        {(field.options || []).map((opt) => (
                          <option key={opt} value={opt}>
                            {t(opt) || opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className="input input-bordered"
                        type={field.type === 'number' ? 'number' : 'text'}
                        value={attr[field.key] || ''}
                        onChange={(e) => setAttr((s) => ({ ...s, [field.key]: e.target.value }))}
                      />
                    )}
                  </label>
                ))}
              </div>
            ) : null;
          })()}

          {/* Variants with per-variant stock */}
          <div className="md:col-span-2">
            <div className="font-medium mb-2">
              {t('Variants') || 'Variants'} <span className="opacity-60 text-sm">({t('optional') || 'optional'})</span>
            </div>
            <div className="space-y-2">
              {variants.map((v, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-start">
                  <input
                    className="input input-bordered col-span-4"
                    placeholder={t('Size') || 'Size'}
                    value={v.size}
                    onChange={(e) => setVariants((rows) => rows.map((r, i) => (i === idx ? { ...r, size: e.target.value } : r)))}
                  />
                  <input
                    className="input input-bordered col-span-4"
                    placeholder={t('Color') || 'Color'}
                    value={v.color}
                    onChange={(e) => setVariants((rows) => rows.map((r, i) => (i === idx ? { ...r, color: e.target.value } : r)))}
                  />
                  <div className="col-span-3">
                    <input
                      className="input input-bordered w-full"
                      type="number"
                      min="0"
                      placeholder={t('Stock') || 'Stock'}
                      value={v.stock}
                      onChange={(e) => handleVariantStockChange(idx, e.target.value)}
                    />
                    <div className="text-[11px] opacity-60 mt-1">
                      {t('Max') || 'Max'}: {Math.max(totalStock - variants.reduce((s, r, i) => (i === idx ? s : s + (Number(r.stock || 0) || 0)), 0), 0)}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm col-span-1"
                    onClick={() => setVariants((rows) => rows.filter((_, i) => i !== idx))}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button type="button" className="btn btn-outline btn-sm" onClick={addVariant}>
                {t('Add variant') || 'Add variant'}
              </button>
            </div>
          </div>

          <div className="md:col-span-2 text-right">
            <button className="btn btn-primary" onClick={onCreate}>
              {t('Add Product') || 'Add Product'}
            </button>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 border">
        <div className="card-body">
          {loading && <div className="opacity-60">{t('Loading…') || 'Loading…'}</div>}
          {!loading && items.length === 0 && <div className="opacity-60">{t('No products') || 'No products'}</div>}
          {!loading && items.length > 0 && (
            <ul className="divide-y">
              {items.map((p) => (
                <li key={p.id} className="py-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-xs opacity-70">SKU: {p.articleNumber}</div>
                      <div className="text-xs opacity-70">
                        {t('Stock') || 'Stock'}: {Number(p.stockOnHand ?? 0)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="btn btn-ghost btn-xs" onClick={() => openEdit(p)}>
                        {t('Edit') || 'Edit'}
                      </button>
                      <label className="btn btn-sm">
                        {uploadingId === p.id ? t('Uploading…') || 'Uploading…' : t('Add Image') || 'Add Image'}
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) onUpload(p.id, f);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  {Array.isArray(p.media) && p.media.length > 0 && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {p.media.map((m) => {
                        const img = m.url || '';
                        const src =
                          img && !/^https?:\/\//.test(img)
                            ? `${import.meta.env.VITE_FILES_BASE_URL || ''}${img.startsWith('/') ? '' : '/'}${img}`
                            : img;
                        return (
                          <div key={m.id} className="relative">
                            <img src={src} alt="" className="w-16 h-16 object-cover rounded" />
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs absolute -top-2 -right-2"
                              onClick={async () => {
                                try {
                                  await axiosInstance.delete(`/store-products/${p.id}/media/${m.id}`);
                                  await load();
                                } catch (e) {
                                  errorHandler(e, t('Delete failed') || 'Delete failed');
                                }
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="mt-2 text-right">
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={async () => {
                        if (confirm(t('Delete product?') || 'Delete product?')) {
                          try {
                            await axiosInstance.delete(`/store-products/${p.id}`);
                            await load();
                          } catch (e) {
                            errorHandler(e, t('Delete failed') || 'Delete failed');
                          }
                        }
                      }}
                    >
                      {t('Delete') || 'Delete'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {editOpen && (
        <ProductEditModal open={editOpen} itemId={editItem?.id} onClose={closeEdit} onUpdated={load} />
      )}
    </section>
  );
}

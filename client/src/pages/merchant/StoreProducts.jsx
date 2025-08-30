import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/config/axiosConfig';
import { useLang } from '@/context/LangProvider';
import usePageTitle from '@/hooks/usePageTitle';
import { errorHandler } from '@/utils';

export default function StoreProducts() {
  const { id } = useParams();
  usePageTitle('Store Products');
  const storeId = id;
  const { lang, t } = useLang();
  const [categories, setCategories] = useState([]);
  const [catTrs, setCatTrs] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [f, setF] = useState({ categoryId: '', articleNumber: '', name: '', description: '' });
  const [attr, setAttr] = useState({});
  const [uploadingId, setUploadingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [cRes, tRes, pRes] = await Promise.all([
        axiosInstance.get('/categories', { params: { limit: 1000 } }),
        axiosInstance.get('/category-translations', { params: { limit: 5000 } }).catch(()=>({ data: [] })),
        axiosInstance.get('/store-products', { params: { storeId } }),
      ]);
      setCategories(cRes?.data?.items || cRes?.data || []);
      setCatTrs(tRes?.data?.items || tRes?.data || []);
      setItems(pRes?.data || []);
    } catch (e) { errorHandler(e, t('Failed to load') || 'Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (storeId) load(); }, [storeId]);

  const onCreate = async () => {
    const payload = { storeId: Number(storeId), categoryId: f.categoryId ? Number(f.categoryId) : null, articleNumber: f.articleNumber.trim(), name: f.name.trim(), description: f.description.trim(), attributes: attr };
    // Enforce subcategory when a parent category is selected
    const selected = categories.find(c => String(c.id) === String(payload.categoryId));
    if (selected) {
      const hasChildren = categories.some(c => String(c.parentId || '') === String(selected.id));
      if (hasChildren) return errorHandler(null, t('Please select a subcategory'));
    }
    if (!payload.articleNumber || !payload.name) return;
    try {
      await axiosInstance.post('/store-products', payload);
      setF({ categoryId: '', articleNumber: '', name: '', description: '' });
      setAttr({});
      await load();
    } catch (e) { errorHandler(e, t('Create failed') || 'Create failed'); }
  };

  const onUpload = async (productId, file) => {
    try {
      setUploadingId(productId);
      const base64 = await toBase64(file);
      const filename = `${Date.now()}_${file.name}`;
      const upRes = await axiosInstance.post('/merchant/upload', { filename, data: base64 });
      const url = upRes?.data?.url;
      if (url) await axiosInstance.post(`/store-products/${productId}/media`, { url });
      await load();
    } catch (e) { errorHandler(e, t('Upload failed') || 'Upload failed'); }
    finally { setUploadingId(null); }
  };

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  return (
    <section className="p-4 space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">{t('Store')} {storeId} — {t('Products')}</h1>

      <div className="card bg-base-100 border">
        <div className="card-body grid md:grid-cols-2 gap-3">
          <label className="form-control">
            <span className="label-text">{t('SKU') || 'Article Number (SKU)'}</span>
            <input className="input input-bordered" value={f.articleNumber} onChange={(e)=>setF(s=>({...s, articleNumber:e.target.value}))} />
          </label>
          <label className="form-control">
            <span className="label-text">{t('Name') || 'Name'}</span>
            <input className="input input-bordered" value={f.name} onChange={(e)=>setF(s=>({...s, name:e.target.value}))} />
          </label>
          <label className="form-control">
            <span className="label-text">{t('Category') || 'Category'}</span>
            <select className="select select-bordered" value={f.categoryId} onChange={(e)=>{ setF(s=>({...s, categoryId:e.target.value})); setAttr({}); }}>
              <option value="">{t('None') || '— none —'}</option>
              {categories.map(c => {
                const pref = (catTrs || []).find(t => Number(t.categoryId) === Number(c.id) && t.locale === lang);
                const fallback = (catTrs || []).find(t => Number(t.categoryId) === Number(c.id) && t.locale === 'en') ||
                                 (catTrs || []).find(t => Number(t.categoryId) === Number(c.id));
                const tr = pref || fallback;
                return <option key={c.id} value={c.id}>{tr?.name || tr?.slug || `#${c.id}`}</option>;
              })}
            </select>
          </label>
          {(() => {
            const selected = categories.find(c => String(c.id) === String(f.categoryId));
            const children = selected ? categories.filter(c => String(c.parentId || '') === String(selected.id)) : [];
            if (children.length === 0) return null;
            return (
              <label className="form-control">
                <span className="label-text">{t('Subcategory') || 'Subcategory'}</span>
                <select className="select select-bordered" value={''} onChange={(e)=>{ const v = e.target.value; if (v) setF(s=>({...s, categoryId:v})); }}>
                  <option value="">{t('Select') || 'Select'}</option>
                  {children.map(ch => {
                    const tr = (catTrs || []).find(t => Number(t.categoryId) === Number(ch.id) && (t.locale === lang || t.locale === 'en')) ||
                                (catTrs || []).find(t => Number(t.categoryId) === Number(ch.id));
                    return <option key={ch.id} value={ch.id}>{tr?.name || tr?.slug || `#${ch.id}`}</option>;
                  })}
                </select>
              </label>
            );
          })()}
          <label className="form-control md:col-span-2">
            <span className="label-text">{t('Description') || 'Description'}</span>
            <textarea className="textarea textarea-bordered" rows={3} value={f.description} onChange={(e)=>setF(s=>({...s, description:e.target.value}))} />
          </label>
          {/* Dynamic attributes based on selected category fields */}
          {(() => {
            const cat = categories.find(c => String(c.id) === String(f.categoryId));
            const fields = cat?.metadata?.filters?.fields || [];
            return fields.length > 0 ? (
              <div className="md:col-span-2 grid md:grid-cols-2 gap-3">
                {fields.map(field => (
                  <label key={field.key} className="form-control">
                    <span className="label-text">{field.label || field.key}</span>
                    {field.type === 'select' ? (
                      <select className="select select-bordered" value={attr[field.key] || ''} onChange={(e)=>setAttr(s=>({...s, [field.key]: e.target.value}))}>
                        <option value="">—</option>
                        {(field.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input className="input input-bordered" type={field.type==='number'?'number':'text'} value={attr[field.key] || ''} onChange={(e)=>setAttr(s=>({...s, [field.key]: e.target.value}))} />
                    )}
                  </label>
                ))}
              </div>
            ) : null;
          })()}
          <div className="md:col-span-2 text-right">
            <button className="btn btn-primary" onClick={onCreate}>{t('Add Product') || 'Add Product'}</button>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 border">
        <div className="card-body">
          {loading && <div className="opacity-60">{t('Loading…') || 'Loading…'}</div>}
          {!loading && items.length === 0 && <div className="opacity-60">{t('No products') || 'No products'}</div>}
          {!loading && items.length > 0 && (
            <ul className="divide-y">
              {items.map(p => (
                <li key={p.id} className="py-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-xs opacity-70">SKU: {p.articleNumber}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="btn btn-sm">
                        {uploadingId===p.id ? (t('Uploading…') || 'Uploading…') : (t('Add Image') || 'Add Image')}
                        <input type="file" hidden accept="image/*" onChange={(e)=>{ const f=e.target.files?.[0]; if (f) onUpload(p.id, f); }} />
                      </label>
                    </div>
                  </div>
                  {Array.isArray(p.media) && p.media.length>0 && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {p.media.map(m => {
                        const img = m.url || '';
                        const src = img && !/^https?:\/\//.test(img)
                          ? `${import.meta.env.VITE_FILES_BASE_URL || ''}${img.startsWith('/')? '' : '/'}${img}`
                          : img;
                        return (
                          <div key={m.id} className="relative">
                            <img src={src} alt="" className="w-16 h-16 object-cover rounded" />
                            <button type="button" className="btn btn-ghost btn-xs absolute -top-2 -right-2" onClick={async()=>{ try{ await axiosInstance.delete(`/store-products/${p.id}/media/${m.id}`); await load(); } catch(e){ errorHandler(e, t('Delete failed') || 'Delete failed'); } }}>✕</button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="mt-2 text-right">
                    <button className="btn btn-ghost btn-xs" onClick={async()=>{ if(confirm(t('Delete product?') || 'Delete product?')) { try{ await axiosInstance.delete(`/store-products/${p.id}`); await load(); } catch(e){ errorHandler(e, t('Delete failed') || 'Delete failed'); } } }}>{t('Delete') || 'Delete'}</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

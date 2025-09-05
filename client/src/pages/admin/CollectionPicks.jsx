import { useEffect, useMemo, useState } from 'react';
import axiosInstance from '@/config/axiosConfig';
import usePageTitle from '@/hooks/usePageTitle';
import { useLang } from '@/context/LangProvider';
import Spinner from '@/components/UI/Spinner.jsx';
import { errorHandler } from '@/utils';

export default function CollectionPicks() {
  const { t, lang } = useLang();
  usePageTitle(lang === 'ar' ? 'إدارة المجموعات' : 'Manage Collections');

  const [collections, setCollections] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    kind: 'storeOffer',
    refId: '',
    rank: '',
    pinned: false,
    isActive: true,
  });

  const manualCollections = useMemo(
    () => (collections || []).filter((c) => c.type === 'manual' && c.isActive),
    [collections]
  );

  const loadCollections = async () => {
    try {
      const res = await axiosInstance.get('/collections', { params: { limit: 1000 } });
      const list = res?.data?.items || res?.data || [];
      setCollections(list);
      // default to "featured" if exists
      const featured = list.find((c) => c.key === 'featured' && c.type === 'manual');
      setSelectedId((featured?.id ?? list.find((c) => c.type === 'manual')?.id) || '');
    } catch (e) {
      errorHandler(e, t('Failed to load') || 'Failed to load');
    }
  };

  const loadItems = async (collectionId) => {
    if (!collectionId) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get('/collection-items', { params: { collectionId } });
      const rows = res?.data?.items || res?.data || [];
      // normalize order: pinned desc, rank asc, id asc already from API
      setItems(rows);
    } catch (e) {
      errorHandler(e, t('Failed to load') || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      await loadCollections();
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedId) loadItems(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const onCreate = async () => {
    if (!selectedId) return;
    const payload = {
      collectionId: Number(selectedId),
      kind: form.kind,
      refId: Number(form.refId),
      pinned: Boolean(form.pinned),
      isActive: Boolean(form.isActive),
    };
    if (form.rank !== '') payload.rank = Math.max(0, Number(form.rank) || 0);
    if (!payload.refId) return;

    setSaving(true);
    try {
      await axiosInstance.post('/collection-items', payload);
      setForm({ kind: 'storeOffer', refId: '', rank: '', pinned: false, isActive: true });
      await loadItems(selectedId);
    } catch (e) {
      errorHandler(e, t('Create failed') || 'Create failed');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!confirm(lang === 'ar' ? 'حذف العنصر؟' : 'Delete item?')) return;
    try {
      await axiosInstance.delete(`/collection-items/${id}`);
      await loadItems(selectedId);
    } catch (e) {
      errorHandler(e, t('Delete failed') || 'Delete failed');
    }
  };

  const updateItem = async (id, patch) => {
    try {
      await axiosInstance.put(`/collection-items/${id}`, patch);
      await loadItems(selectedId);
    } catch (e) {
      errorHandler(e, t('Update failed') || 'Update failed');
    }
  };

  const move = async (idx, dir) => {
    // simple reorder by swapping rank values
    const a = items[idx];
    const b = items[idx + dir];
    if (!a || !b) return;
    await Promise.all([
      axiosInstance.put(`/collection-items/${a.id}`, { rank: b.rank }),
      axiosInstance.put(`/collection-items/${b.id}`, { rank: a.rank }),
    ]).catch((e) => errorHandler(e, t('Update failed') || 'Update failed'));
    await loadItems(selectedId);
  };

  const trOf = (c) => {
    const trs = c?.translations || [];
    const map = trs.reduce((m, tr) => ((m[tr.locale] = tr), m), {});
    return map[lang] || map.ar || map.en || trs[0] || null;
  };

  return (
    <section className="p-4 max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">
        {lang === 'ar' ? 'إدارة المجموعات' : 'Manage Collections'}
      </h1>

      <div className="card bg-base-100 border">
        <div className="card-body grid md:grid-cols-3 gap-3">
          <label className="form-control md:col-span-2">
            <span className="label-text">{lang === 'ar' ? 'المجموعة اليدوية' : 'Manual collection'}</span>
            <select
              className="select select-bordered"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              <option value="">{lang === 'ar' ? '— اختر —' : '— Select —'}</option>
              {manualCollections.map((c) => {
                const tr = trOf(c);
                return (
                  <option key={c.id} value={c.id}>
                    {tr?.title || c.key} {c.key ? `(${c.key})` : ''}
                  </option>
                );
              })}
            </select>
          </label>

          <div className="opacity-75 self-end">
            {lang === 'ar' ? 'نصائح: أضف عناصر بواسطة المعرّف. يمكنك تثبيت عناصر وتعديل الترتيب.' : 'Tip: Add items by ID. You can pin items and adjust order.'}
          </div>
        </div>
      </div>

      {/* Create form */}
      <div className="card bg-base-100 border">
        <div className="card-body grid md:grid-cols-6 gap-3">
          <label className="form-control">
            <span className="label-text">{lang === 'ar' ? 'النوع' : 'Kind'}</span>
            <select
              className="select select-bordered"
              value={form.kind}
              onChange={(e) => setForm((s) => ({ ...s, kind: e.target.value }))}
            >
              <option value="storeOffer">{lang === 'ar' ? 'عرض متجر' : 'Store Offer'}</option>
              <option value="product">{lang === 'ar' ? 'منتج' : 'Product'}</option>
              <option value="listing">{lang === 'ar' ? 'إعلان' : 'Listing'}</option>
            </select>
          </label>

          <label className="form-control">
            <span className="label-text">{lang === 'ar' ? 'المعرف' : 'Ref ID'}</span>
            <input
              className="input input-bordered"
              type="number"
              value={form.refId}
              onChange={(e) => setForm((s) => ({ ...s, refId: e.target.value }))}
              placeholder="e.g. 11"
            />
          </label>

          <label className="form-control">
            <span className="label-text">{lang === 'ar' ? 'الترتيب' : 'Rank'}</span>
            <input
              className="input input-bordered"
              type="number"
              value={form.rank}
              onChange={(e) => setForm((s) => ({ ...s, rank: e.target.value }))}
              placeholder="auto"
            />
          </label>

          <label className="form-control">
            <span className="label-text">{lang === 'ar' ? 'مثبّت' : 'Pinned'}</span>
            <input
              type="checkbox"
              className="toggle"
              checked={form.pinned}
              onChange={(e) => setForm((s) => ({ ...s, pinned: e.target.checked }))}
            />
          </label>

          <label className="form-control">
            <span className="label-text">{lang === 'ar' ? 'نشط' : 'Active'}</span>
            <input
              type="checkbox"
              className="toggle"
              checked={form.isActive}
              onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.checked }))}
            />
          </label>

          <div className="flex items-end">
            <button className={`btn btn-primary ${saving ? 'btn-disabled' : ''}`} onClick={onCreate}>
              {saving ? (lang === 'ar' ? 'جارٍ الحفظ…' : 'Saving…') : (lang === 'ar' ? 'إضافة' : 'Add')}
            </button>
          </div>
        </div>
      </div>

      {/* Items table */}
      <div className="card bg-base-100 border">
        <div className="card-body">
          {loading ? (
            <div className="flex items-center gap-2">
              <Spinner size={20} />
              <span className="opacity-70">{lang === 'ar' ? 'جارِ التحميل…' : 'Loading…'}</span>
            </div>
          ) : items.length === 0 ? (
            <div className="opacity-70">{lang === 'ar' ? 'لا عناصر' : 'No items'}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>{lang === 'ar' ? 'النوع' : 'Kind'}</th>
                    <th>refId</th>
                    <th>{lang === 'ar' ? 'مثبّت' : 'Pinned'}</th>
                    <th>{lang === 'ar' ? 'ترتيب' : 'Rank'}</th>
                    <th>{lang === 'ar' ? 'نشط' : 'Active'}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={it.id}>
                      <td>{it.id}</td>
                      <td>{it.kind}</td>
                      <td>{it.refId}</td>
                      <td>
                        <input
                          type="checkbox"
                          className="toggle toggle-sm"
                          checked={!!it.pinned}
                          onChange={(e) => updateItem(it.id, { pinned: e.target.checked })}
                        />
                      </td>
                      <td className="whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <input
                            className="input input-bordered input-xs w-20"
                            type="number"
                            value={it.rank}
                            onChange={(e) => {
                              const v = Number(e.target.value);
                              setItems((rows) =>
                                rows.map((r) => (r.id === it.id ? { ...r, rank: v } : r))
                              );
                            }}
                            onBlur={async (e) => {
                              const v = Number(e.target.value);
                              await updateItem(it.id, { rank: Number.isFinite(v) ? v : it.rank });
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs"
                            onClick={() => move(idx, -1)}
                            disabled={idx === 0}
                            title={lang === 'ar' ? 'أعلى' : 'Up'}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs"
                            onClick={() => move(idx, +1)}
                            disabled={idx === items.length - 1}
                            title={lang === 'ar' ? 'أسفل' : 'Down'}
                          >
                            ↓
                          </button>
                        </div>
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          className="toggle toggle-sm"
                          checked={!!it.isActive}
                          onChange={(e) => updateItem(it.id, { isActive: e.target.checked })}
                        />
                      </td>
                      <td className="text-right">
                        <button className="btn btn-ghost btn-xs" onClick={() => onDelete(it.id)}>
                          {lang === 'ar' ? 'حذف' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

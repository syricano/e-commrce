import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/config/axiosConfig';
import usePageTitle from '@/hooks/usePageTitle';
import { errorHandler } from '@/utils';
import { useLang } from '@/context/LangProvider';

export default function StoreCategories() {
  const { id } = useParams();
  usePageTitle('Store Categories');
  const storeId = id;
  const { t } = useLang();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [f, setF] = useState({ name: '', parentId: '', fieldsText: '' });

  const byId = useMemo(() => {
    const map = new Map();
    for (const c of items) map.set(c.id, c);
    return map;
  }, [items]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/store-categories', { params: { storeId } });
      setItems(res?.data || []);
    } catch (e) { errorHandler(e, t('Failed to load categories') || 'Failed to load categories'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (storeId) load(); }, [storeId]);

  const onCreate = async () => {
    const payload = { storeId: Number(storeId), name: f.name.trim(), parentId: f.parentId || null };
    if (!payload.name) return;
    if (f.fieldsText.trim()) {
      try { payload.fields = JSON.parse(f.fieldsText); } catch { return alert(t('Fields must be valid JSON') || 'Fields must be valid JSON'); }
    }
    try {
      await axiosInstance.post('/store-categories', payload);
      setF({ name: '', parentId: '', fieldsText: '' });
      await load();
    } catch (e) { errorHandler(e, t('Create failed') || 'Create failed'); }
  };

  return (
    <section className="p-4 space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">{t('Store')} {storeId} — {t('Categories')}</h1>

      <div className="card bg-base-100 border">
        <div className="card-body grid md:grid-cols-3 gap-3">
          <label className="form-control">
            <span className="label-text">{t('Name') || 'Name'}</span>
            <input className="input input-bordered" value={f.name} onChange={(e)=>setF(s=>({...s, name:e.target.value}))} />
          </label>
          <label className="form-control">
            <span className="label-text">{t('Parent') || 'Parent'}</span>
            <select className="select select-bordered" value={f.parentId} onChange={(e)=>setF(s=>({...s, parentId:e.target.value}))}>
              <option value="">{t('root') || '— root —'}</option>
              {items.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <div className="md:col-span-3">
            <label className="form-control">
              <span className="label-text">{t('Fields JSON help') || 'Fields (JSON: { "filters": { "fields": [...] } })'}</span>
              <textarea className="textarea textarea-bordered" rows={4} value={f.fieldsText} onChange={(e)=>setF(s=>({...s, fieldsText:e.target.value}))} placeholder='{"filters":{"fields":[{"key":"brand","label":"Brand","type":"text"}]}}' />
            </label>
          </div>
          <div className="md:col-span-3 text-right">
            <button className="btn btn-primary" onClick={onCreate}>{t('Add Category') || 'Add Category'}</button>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 border">
        <div className="card-body">
          {loading && <div className="opacity-60">{t('Loading…') || 'Loading…'}</div>}
          {!loading && items.length === 0 && <div className="opacity-60">{t('No categories') || 'No categories'}</div>}
          {!loading && items.length > 0 && (
            <ul className="divide-y">
              {items.map(c => (
                <li key={c.id} className="py-2 flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{c.name}</div>
                    {c.parentId && <div className="text-xs opacity-70">{t('Parent') || 'Parent'}: {byId.get(c.parentId)?.name || c.parentId}</div>}
                  </div>
                  <div className="text-xs opacity-70">{c.slug}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

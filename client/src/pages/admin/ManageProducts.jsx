import { useEffect, useMemo, useState } from 'react';
import { createCrud } from '@/services/crudFactory';
import { adminModerateProduct } from '@/services/admin';
import { errorHandler } from '@/utils';
import { toast } from 'react-hot-toast';
import { useLang } from '@/context/LangProvider';
import usePageTitle from '@/hooks/usePageTitle';

const productsApi = createCrud('/products');

export default function ManageProducts() {
  const { t } = useLang();
  usePageTitle('ManageProducts');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await productsApi.list({ limit: 200 });
      const rows = res?.items || res?.data?.items || res?.data || [];
      setItems(Array.isArray(rows) ? rows : []);
    } catch (e) { errorHandler(e,'Failed to load products'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const onModerate = async (p, moderationStatus, isActive) => {
    try {
      await adminModerateProduct(p.id, { moderationStatus, isActive });
      toast.success('Updated');
      load();
    } catch (e) { errorHandler(e,'Update failed'); }
  };

  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const s = q.trim().toLowerCase();
    return items.filter((p) => String(p.canonicalSku || p.id || '').toLowerCase().includes(s));
  }, [items, q]);

  return (
    <section className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">{t('Products')}</h1>
      <div className="flex items-end gap-2">
        <label className="form-control">
          <span className="label-text">Search</span>
          <input className="input input-bordered" value={q} onChange={(e)=>setQ(e.target.value)} placeholder="sku, id…" />
        </label>
        <button className="btn" onClick={load} disabled={loading}>{loading?'…':t('refresh')}</button>
      </div>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>SKU</th>
              <th>Brand</th>
              <th>Status</th>
              <th>Active</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.canonicalSku || '—'}</td>
                <td>{p.brandId || '—'}</td>
                <td>{p.moderationStatus || 'draft'}</td>
                <td>{String(!!p.isActive)}</td>
                <td className="text-right space-x-2">
                  <button className="btn btn-xs" onClick={()=>onModerate(p,'approved',true)}>{t('Approve') || 'Approve'}</button>
                  <button className="btn btn-warning btn-xs" onClick={()=>onModerate(p,'rejected',false)}>{t('Reject') || 'Reject'}</button>
                  <button className="btn btn-ghost btn-xs" onClick={()=>onModerate(p,undefined,!p.isActive)}>{p.isActive ? (t('Deactivate') || 'Deactivate') : (t('Activate') || 'Activate')}</button>
                </td>
              </tr>
            ))}
            {filtered.length===0 && !loading && (<tr><td colSpan={6} className="py-6 text-center opacity-60">No products</td></tr>)}
          </tbody>
        </table>
      </div>
    </section>
  );
}

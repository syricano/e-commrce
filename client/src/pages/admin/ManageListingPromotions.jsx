import { useEffect, useMemo, useState } from 'react';
import axiosInstance from '@/config/axiosConfig';
import { errorHandler } from '@/utils';
import { useLang } from '@/context/LangProvider';
import usePageTitle from '@/hooks/usePageTitle';

export default function ManageListingPromotions() {
  const { t } = useLang();
  usePageTitle('ManageListingPromotions');
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [f, setF] = useState({ listingId: '', type: '' });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/promotions', { params: { limit: 100, status: status || undefined, type: f.type || undefined, listingId: f.listingId || undefined } });
      setItems(res?.data?.items || res?.items || res?.data || []);
    } catch (e) { errorHandler(e, 'Failed to load promotions'); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ load(); }, [status]);

  const table = useMemo(() => (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>{t('ID') || 'ID'}</th>
            <th>{t('Listing') || 'Listing'}</th>
            <th>{t('Type') || 'Type'}</th>
            <th>{t('Status') || 'Status'}</th>
            <th>{t('Created') || 'Created'}</th>
          </tr>
        </thead>
        <tbody>
          {items.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.listingId}</td>
              <td>{p.type}</td>
              <td>{p.status}</td>
              <td>{p.createdAt ? new Date(p.createdAt).toLocaleString() : '—'}</td>
            </tr>
          ))}
          {items.length===0 && !loading && (<tr><td colSpan={5} className="text-center opacity-60 py-6">{t('noItems')}</td></tr>)}
        </tbody>
      </table>
    </div>
  ), [items, loading, t]);

  return (
    <section className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">{t('ManageListingPromotions')}</h1>
      <div className="grid md:grid-cols-4 gap-2 items-end">
        <label className="form-control">
          <span className="label-text">{t('Status')}</span>
          <select className="select select-bordered" value={status} onChange={(e)=>setStatus(e.target.value)}>
            <option value="">{t('Any') || 'Any'}</option>
            {['active','expired','cancelled'].map(s=>(<option key={s} value={s}>{t(s) || s}</option>))}
          </select>
        </label>
        <label className="form-control">
          <span className="label-text">{t('Listing') || 'Listing'}</span>
          <input className="input input-bordered" value={f.listingId} onChange={(e)=>setF(s=>({...s, listingId: e.target.value}))} />
        </label>
        <label className="form-control">
          <span className="label-text">{t('Type') || 'Type'}</span>
          <select className="select select-bordered" value={f.type} onChange={(e)=>setF(s=>({...s, type: e.target.value}))}>
            <option value="">{t('Any') || 'Any'}</option>
            {['bump'].map(x => <option key={x} value={x}>{x}</option>)}
          </select>
        </label>
        <div className="flex gap-2">
          <button className="btn" onClick={load} disabled={loading}>{loading?'…':t('refresh')}</button>
          <button className="btn btn-ghost" onClick={()=>{ setF({ listingId:'', type:'' }); setStatus(''); }}>{t('Reset') || 'Reset'}</button>
        </div>
      </div>
      {table}
    </section>
  );
}

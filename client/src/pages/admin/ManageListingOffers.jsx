import { useEffect, useMemo, useState } from 'react';
import axiosInstance from '@/config/axiosConfig';
import { errorHandler } from '@/utils';
import { useLang } from '@/context/LangProvider';
import usePageTitle from '@/hooks/usePageTitle';

export default function ManageListingOffers() {
  const { t } = useLang();
  usePageTitle('ManageListingOffers');
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/listing-offers', { params: { limit: 100, status: status || undefined } });
      setItems(res?.data?.items || res?.items || res?.data || []);
    } catch (e) { errorHandler(e, 'Failed to load offers'); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ load(); }, [status]);

  const table = useMemo(() => (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Listing</th>
            <th>Buyer</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map(o => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.listingId}</td>
              <td>{o.buyerUserId}</td>
              <td>{o.amount}</td>
              <td>{o.status}</td>
            </tr>
          ))}
          {items.length===0 && !loading && (<tr><td colSpan={5} className="text-center opacity-60 py-6">{t('noItems')}</td></tr>)}
        </tbody>
      </table>
    </div>
  ), [items, loading, t]);

  return (
    <section className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">{t('ManageListingOffers')}</h1>
      <div className="flex items-end gap-2">
        <label className="form-control">
          <span className="label-text">{t('Status')}</span>
          <select className="select select-bordered" value={status} onChange={(e)=>setStatus(e.target.value)}>
            <option value="">Any</option>
            {['open','accepted','declined'].map(s=>(<option key={s} value={s}>{s}</option>))}
          </select>
        </label>
        <button className="btn" onClick={load} disabled={loading}>{loading?'…':t('refresh')}</button>
      </div>
      {table}
    </section>
  );
}

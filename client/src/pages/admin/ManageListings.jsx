import { useEffect, useMemo, useState } from 'react';
import { createCrud } from '@/services/crudFactory';
import { adminModerateListing } from '@/services/admin';
import { errorHandler } from '@/utils';
import { toast } from 'react-hot-toast';
import { useLang } from '@/context/LangProvider';
import usePageTitle from '@/hooks/usePageTitle';

const listingsApi = createCrud('/listings');
const STATUSES = ['draft','active','reserved','sold','expired'];

export default function ManageListings() {
  const { t } = useLang();
  usePageTitle('ManageListings');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await listingsApi.list({ limit: 100, status: status || undefined });
      setItems(res?.items || res?.data?.items || res?.data || []);
    } catch (e) { errorHandler(e, 'Failed to load listings'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [status]);

  const onSetStatus = async (l, newStatus) => {
    try {
      await adminModerateListing(l.id, { status: newStatus });
      toast.success('Updated');
      load();
    } catch (e) { errorHandler(e, 'Update failed'); }
  };

  const rows = useMemo(() => items, [items]);

  return (
    <section className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">{t('Listings')}</h1>
      <div className="flex items-end gap-2">
        <label className="form-control">
          <span className="label-text">{t('Status') || 'Status'}</span>
          <select className="select select-bordered" value={status} onChange={(e)=>setStatus(e.target.value)}>
            <option value="">{t('Any') || 'Any'}</option>
            {STATUSES.map(s => <option key={s} value={s}>{t(s) || s}</option>)}
          </select>
        </label>
        <button className="btn" onClick={load} disabled={loading}>{loading?'…':t('refresh')}</button>
      </div>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>{t('ID') || 'ID'}</th>
              <th>{t('Owner') || 'Owner'}</th>
              <th>{t('Category') || 'Category'}</th>
              <th>{t('Price') || 'Price'}</th>
              <th>{t('Status') || 'Status'}</th>
              <th className="text-right">{t('Actions') || 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(l => (
              <tr key={l.id}>
                <td>{l.id}</td>
                <td>{l.ownerUserId}</td>
                <td>{l.categoryId || '—'}</td>
                <td>{l.priceAmount} {l.currency}</td>
                <td>{l.status}</td>
                <td className="text-right space-x-2">
                  <select className="select select-bordered select-xs" value={l.status} onChange={(e)=>onSetStatus(l, e.target.value)}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {rows.length===0 && !loading && (<tr><td colSpan={6} className="text-center opacity-60 py-6">{t('No listings') || 'No listings'}</td></tr>)}
          </tbody>
        </table>
      </div>
    </section>
  );
}

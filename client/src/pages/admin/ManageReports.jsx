import { useEffect, useState } from 'react';
import { adminListReports, adminReviewReport } from '@/services/admin';
import { errorHandler } from '@/utils';
import { toast } from 'react-hot-toast';
import { useLang } from '@/context/LangProvider';
import usePageTitle from '@/hooks/usePageTitle';

const STATES = ['open','reviewed','actioned'];

export default function ManageReports() {
  const { t } = useLang();
  usePageTitle('ManageReports');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminListReports({ status: status || undefined, limit: 200 });
      setItems(res?.items || res?.data?.items || res?.data || []);
    } catch (e) { errorHandler(e,'Failed to load reports'); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ load(); }, [status]);

  const review = async (r, newStatus) => {
    try {
      await adminReviewReport(r.id, { status: newStatus, note: note || undefined });
      toast.success('Updated');
      setNote('');
      load();
    } catch (e) { errorHandler(e, 'Update failed'); }
  };

  return (
    <section className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">{t('Reports')}</h1>
      <div className="flex items-end gap-2">
        <label className="form-control">
          <span className="label-text">Status</span>
          <select className="select select-bordered" value={status} onChange={(e)=>setStatus(e.target.value)}>
            <option value="">Any</option>
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="form-control w-full max-w-xs">
          <span className="label-text">Admin note (optional)</span>
          <input className="input input-bordered" value={note} onChange={e=>setNote(e.target.value)} placeholder="decision note" />
        </label>
        <button className="btn" onClick={load} disabled={loading}>{loading?'…':t('refresh')}</button>
      </div>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Listing</th>
              <th>Reason</th>
              <th>Details</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(r => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.listingId}</td>
                <td>{r.reason}</td>
                <td className="max-w-xl whitespace-pre-wrap break-words">{r.details || '—'}</td>
                <td>{r.status}</td>
                <td className="text-right space-x-2">
                  <button className="btn btn-xs" onClick={()=>review(r,'reviewed')}>Mark reviewed</button>
                  <button className="btn btn-primary btn-xs" onClick={()=>review(r,'actioned')}>Mark actioned</button>
                </td>
              </tr>
            ))}
            {items.length===0 && !loading && (<tr><td colSpan={6} className="py-6 text-center opacity-60">No reports</td></tr>)}
          </tbody>
        </table>
      </div>
    </section>
  );
}

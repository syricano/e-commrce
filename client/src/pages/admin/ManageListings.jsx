import { useEffect, useMemo, useState } from 'react';
import { createCrud } from '@/services/crudFactory';
import axiosInstance from '@/config/axiosConfig';
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
  const [filters, setFilters] = useState({ id: '', ownerUserId: '', categoryId: '', minPrice: '', maxPrice: '', title: '' });
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await listingsApi.list({
        limit: 100,
        status: status || undefined,
        id: filters.id || undefined,
        ownerUserId: filters.ownerUserId || undefined,
        categoryId: filters.categoryId || undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        title: filters.title || undefined,
      });
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
      <div className="grid md:grid-cols-3 gap-2 items-end">
        <label className="form-control">
          <span className="label-text">{t('Status') || 'Status'}</span>
          <select className="select select-bordered" value={status} onChange={(e)=>setStatus(e.target.value)}>
            <option value="">{t('Any') || 'Any'}</option>
            {STATUSES.map(s => <option key={s} value={s}>{t(s) || s}</option>)}
          </select>
        </label>
        <label className="form-control">
          <span className="label-text">ID</span>
          <input className="input input-bordered" value={filters.id} onChange={(e)=>setFilters(s=>({...s,id:e.target.value}))} />
        </label>
        <label className="form-control">
          <span className="label-text">{t('Owner') || 'Owner'}</span>
          <input className="input input-bordered" value={filters.ownerUserId} onChange={(e)=>setFilters(s=>({...s,ownerUserId:e.target.value}))} />
        </label>
        <label className="form-control">
          <span className="label-text">{t('Category') || 'Category'}</span>
          <input className="input input-bordered" value={filters.categoryId} onChange={(e)=>setFilters(s=>({...s,categoryId:e.target.value}))} />
        </label>
        <label className="form-control">
          <span className="label-text">{t('Min price') || 'Min price'}</span>
          <input className="input input-bordered" type="number" value={filters.minPrice} onChange={(e)=>setFilters(s=>({...s,minPrice:e.target.value}))} />
        </label>
        <label className="form-control">
          <span className="label-text">{t('Max price') || 'Max price'}</span>
          <input className="input input-bordered" type="number" value={filters.maxPrice} onChange={(e)=>setFilters(s=>({...s,maxPrice:e.target.value}))} />
        </label>
        <label className="form-control md:col-span-2">
          <span className="label-text">{t('Title') || 'Title'}</span>
          <input className="input input-bordered" value={filters.title} onChange={(e)=>setFilters(s=>({...s,title:e.target.value}))} />
        </label>
        <div className="md:col-span-1 flex gap-2">
          <button className="btn" onClick={load} disabled={loading}>{loading?'…':t('refresh')}</button>
          <button className="btn btn-ghost" onClick={()=>{ setFilters({ id:'',ownerUserId:'',categoryId:'',minPrice:'',maxPrice:'',title:''}); setStatus(''); }}>{t('Reset') || 'Reset'}</button>
        </div>
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
                <td>
                  {editingId === l.id ? (
                    <div className="flex items-center gap-2">
                      <input className="input input-bordered input-sm w-28" type="number" value={draft.priceAmount ?? l.priceAmount} onChange={(e)=>setDraft(s=>({...s,priceAmount:e.target.value}))} />
                      <input className="input input-bordered input-sm w-20" value={draft.currency ?? l.currency} onChange={(e)=>setDraft(s=>({...s,currency:e.target.value}))} />
                    </div>
                  ) : (
                    <>{l.priceAmount} {l.currency}</>
                  )}
                </td>
                <td>
                  {editingId === l.id ? (
                    <div className="flex items-center gap-2">
                      <select className="select select-bordered select-xs" value={draft.status ?? l.status} onChange={(e)=>setDraft(s=>({...s,status:e.target.value}))}>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <select className="select select-bordered select-xs" value={draft.condition ?? l.condition} onChange={(e)=>setDraft(s=>({...s,condition:e.target.value}))}>
                        {['new','used','refurbished'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <label className="label cursor-pointer gap-1 text-xs">
                        <span>neg</span>
                        <input type="checkbox" className="toggle toggle-xs" checked={(draft.negotiable ?? l.negotiable) ? true : false} onChange={(e)=>setDraft(s=>({...s,negotiable:e.target.checked}))} />
                      </label>
                      <label className="label cursor-pointer gap-1 text-xs">
                        <span>checkout</span>
                        <input type="checkbox" className="toggle toggle-xs" checked={(draft.allowCheckout ?? l.allowCheckout) ? true : false} onChange={(e)=>setDraft(s=>({...s,allowCheckout:e.target.checked}))} />
                      </label>
                    </div>
                  ) : (
                    <span className="badge">{l.status}</span>
                  )}
                </td>
                <td className="text-right space-x-2">
                  {editingId === l.id ? (
                    <>
                      <button className="btn btn-xs" onClick={()=>{ setEditingId(null); setDraft({}); }}>{t('cancel') || 'Cancel'}</button>
                      <button
                        className="btn btn-primary btn-xs"
                        onClick={async ()=>{
                          try {
                            const payload = {
                              priceAmount: draft.priceAmount !== undefined ? Number(draft.priceAmount) : l.priceAmount,
                              currency: draft.currency ?? l.currency,
                              status: draft.status ?? l.status,
                              condition: draft.condition ?? l.condition,
                              negotiable: draft.negotiable ?? l.negotiable,
                              allowCheckout: draft.allowCheckout ?? l.allowCheckout,
                              categoryId: draft.categoryId !== undefined ? Number(draft.categoryId) : l.categoryId,
                            };
                            await axiosInstance.put(`/listings/${l.id}`, payload);
                            toast.success(t('Saved') || 'Saved');
                            setEditingId(null); setDraft({});
                            await load();
                          } catch(e){ errorHandler(e, t('Save failed') || 'Save failed'); }
                        }}
                      >{t('save') || 'Save'}</button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-xs" onClick={()=>{ setEditingId(l.id); setDraft({}); }}>{t('Edit') || 'Edit'}</button>
                      <select className="select select-bordered select-xs" value={l.status} onChange={(e)=>onSetStatus(l, e.target.value)}>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </>
                  )}
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

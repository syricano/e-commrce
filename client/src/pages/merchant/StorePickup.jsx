import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/config/axiosConfig';
import usePageTitle from '@/hooks/usePageTitle';
import StoreNav from '@/components/merchant/StoreNav.jsx';
import { errorHandler } from '@/utils';
import { useLang } from '@/context/LangProvider';
import { COUNTRIES, CITIES_BY_COUNTRY } from '@/services/geo';

export default function StorePickup() {
  const { id } = useParams();
  usePageTitle('Store Pickup');
  const { t } = useLang();
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [times, setTimes] = useState([]);
  const [form, setForm] = useState({ labelAr: '', name: '', country: 'Syria', city: '', address1: '' });
  const [timeForm, setTimeForm] = useState({ day: 0, start: '09:00', end: '17:00' });

  const cities = CITIES_BY_COUNTRY[form.country] || [];

  const load = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/merchant/stores/${id}`);
      const s = res?.data || {};
      const o = s?.shippingOptions || {};
      setEnabled(o?.pickupEnabled !== false);
      setAddresses(Array.isArray(o?.pickupAddresses) ? o.pickupAddresses : []);
      setTimes(Array.isArray(o?.pickupTimes) ? o.pickupTimes : []);
    } catch (e) { errorHandler(e, t('Failed to load') || 'Failed to load'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]);

  const addAddress = () => {
    const a = { label: { ar: form.labelAr || form.name || form.city }, name: form.name || undefined, address1: form.address1, city: form.city, country: form.country };
    setAddresses(list => [...list, a]);
    setForm(f => ({ ...f, labelAr: '', name: '', address1: '' }));
  };
  const removeAddress = (idx) => setAddresses(list => list.filter((_,i)=>i!==idx));

  const addTime = () => { setTimes(list => [...list, { day: Number(timeForm.day||0), start: timeForm.start, end: timeForm.end }]); };
  const removeTime = (idx) => setTimes(list => list.filter((_,i)=>i!==idx));

  const save = async () => {
    const payload = { shippingOptions: { pickupEnabled: !!enabled, pickupAddresses: addresses, pickupTimes: times } };
    try { await axiosInstance.put(`/merchant/stores/${id}/settings`, payload); await load(); }
    catch (e) { errorHandler(e, t('Failed to save') || 'Failed to save'); }
  };

  return (
    <section className="p-4 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">{t('Store')} {id} — {t('Pickup') || 'Pickup'}</h1>
      <StoreNav />
      {loading ? (
        <div className="opacity-70">{t('Loading…') || 'Loading…'}</div>
      ) : (
        <div className="space-y-4">
          <div className="card bg-base-100 border"><div className="card-body">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="toggle" checked={enabled} onChange={e=>setEnabled(e.target.checked)} />
              <span>{t('Enable Pickup') || 'Enable Pickup'}</span>
            </label>
          </div></div>

          <div className="card bg-base-100 border"><div className="card-body space-y-3">
            <div className="font-semibold">{t('Pickup addresses') || 'Pickup addresses'}</div>
            <div className="grid md:grid-cols-4 gap-2">
              <label className="form-control">
                <span className="label-text">{t('Label (AR)') || 'Label (AR)'}</span>
                <input className="input input-bordered" value={form.labelAr} onChange={e=>setForm(f=>({...f, labelAr:e.target.value}))} />
              </label>
              <label className="form-control">
                <span className="label-text">{t('Name') || 'Name'}</span>
                <input className="input input-bordered" value={form.name} onChange={e=>setForm(f=>({...f, name:e.target.value}))} />
              </label>
              <label className="form-control">
                <span className="label-text">{t('Country') || 'Country'}</span>
                <select className="select select-bordered" value={form.country} onChange={(e)=>{ const c=e.target.value; const list=CITIES_BY_COUNTRY[c]||[]; setForm(f=>({...f, country:c, city:list[0]||''})); }}>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="form-control">
                <span className="label-text">{t('City') || 'City'}</span>
                <select className="select select-bordered" value={form.city} onChange={(e)=>setForm(f=>({...f, city:e.target.value}))}>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
            </div>
            <label className="form-control">
              <span className="label-text">{t('Address') || 'Address'}</span>
              <input className="input input-bordered" value={form.address1} onChange={e=>setForm(f=>({...f, address1:e.target.value}))} />
            </label>
            <div className="text-right"><button className="btn btn-sm" onClick={addAddress}>{t('Add') || 'Add'}</button></div>

            <ul className="space-y-2">
              {addresses.map((a, i) => (
                <li key={i} className="border rounded p-2 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{a.label?.ar || a.name || a.city}</div>
                    <div className="opacity-70 text-sm">{[a.address1, a.city, a.country].filter(Boolean).join(' • ')}</div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={()=>removeAddress(i)}>{t('Remove') || 'Remove'}</button>
                </li>
              ))}
            </ul>
          </div></div>

          <div className="card bg-base-100 border"><div className="card-body space-y-3">
            <div className="font-semibold">{t('Pickup times') || 'Pickup times'}</div>
            <div className="grid md:grid-cols-3 gap-2">
              <label className="form-control">
                <span className="label-text">{t('Day') || 'Day'}</span>
                <select className="select select-bordered" value={timeForm.day} onChange={(e)=>setTimeForm(f=>({...f, day:e.target.value}))}>
                  {[0,1,2,3,4,5,6].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </label>
              <label className="form-control">
                <span className="label-text">{t('Start') || 'Start'}</span>
                <input className="input input-bordered" value={timeForm.start} onChange={(e)=>setTimeForm(f=>({...f, start:e.target.value}))} placeholder="09:00" />
              </label>
              <label className="form-control">
                <span className="label-text">{t('End') || 'End'}</span>
                <input className="input input-bordered" value={timeForm.end} onChange={(e)=>setTimeForm(f=>({...f, end:e.target.value}))} placeholder="17:00" />
              </label>
            </div>
            <div className="text-right"><button className="btn btn-sm" onClick={addTime}>{t('Add') || 'Add'}</button></div>
            <ul className="space-y-1">
              {times.map((tw, i) => (
                <li key={i} className="flex items-center justify-between border rounded px-2 py-1">
                  <div>day {tw.day}: {tw.start}–{tw.end}</div>
                  <button className="btn btn-ghost btn-xs" onClick={()=>removeTime(i)}>{t('Remove') || 'Remove'}</button>
                </li>
              ))}
            </ul>
          </div></div>

          <div className="text-right"><button className="btn btn-primary" onClick={save}>{t('save') || 'Save'}</button></div>
        </div>
      )}
    </section>
  );
}


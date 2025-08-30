import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/config/axiosConfig';
import usePageTitle from '@/hooks/usePageTitle';
import { errorHandler } from '@/utils';
import { useLang } from '@/context/LangProvider';

export default function StoreShipping() {
  const { id } = useParams();
  usePageTitle('Store Shipping');
  const { t } = useLang();
  const [store, setStore] = useState(null);
  const [shipping, setShipping] = useState(false);
  const [pickup, setPickup] = useState(false);
  const [pickupDetails, setPickupDetails] = useState('');
  const load = async () => {
    try {
      const res = await axiosInstance.get(`/merchant/stores/${id}`);
      const s = res?.data || null;
      setStore(s);
      const opts = s?.shippingOptions || [];
      setShipping(Array.isArray(opts) ? opts.includes('shipping') : !!opts?.shipping);
      setPickup(Array.isArray(opts) ? opts.includes('pickup') : !!opts?.pickup);
      setPickupDetails(typeof opts === 'object' && opts?.pickupDetails ? String(opts.pickupDetails) : '');
    } catch (e) { errorHandler(e, t('Failed to load') || 'Failed to load'); }
  };
  useEffect(() => { load(); }, [id]);

  const save = async () => {
    const options = { shipping, pickup, pickupDetails: pickupDetails || undefined };
    try { await axiosInstance.put(`/merchant/stores/${id}/settings`, { shippingOptions: options }); await load(); }
    catch (e) { errorHandler(e, t('Failed to save') || 'Failed to save'); }
  };

  return (
    <section className="p-4 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">{t('Store')} {id} — {t('Shipping')}</h1>
      <div className="card bg-base-100 border"><div className="card-body space-y-3">
        <label className="flex items-center gap-2">
          <input type="checkbox" className="toggle" checked={shipping} onChange={e=>setShipping(e.target.checked)} />
          <span>{t('Enable Shipping') || 'Enable Shipping'}</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" className="toggle" checked={pickup} onChange={e=>setPickup(e.target.checked)} />
          <span>{t('Enable Pickup') || 'Enable Pickup'}</span>
        </label>
        <label className="form-control">
          <span className="label-text">{t('Pickup Details') || 'Pickup Details'}</span>
          <textarea className="textarea textarea-bordered" rows={3} value={pickupDetails} onChange={e=>setPickupDetails(e.target.value)} />
        </label>
        <div className="text-right"><button className="btn btn-primary" onClick={save}>{t('save') || 'Save'}</button></div>
      </div></div>
    </section>
  );
}

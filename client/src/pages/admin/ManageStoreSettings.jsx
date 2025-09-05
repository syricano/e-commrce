import { useState } from 'react';
import { useLang } from '@/context/LangProvider';

export default function ManageStoreSettings() {
  const { t } = useLang();
  const [storeId, setStoreId] = useState('');
  const base = storeId ? `/merchant/store/${encodeURIComponent(storeId)}` : '';

  return (
    <section className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">{t('Store Management') || 'Store Management'}</h1>
      <div className="grid md:grid-cols-3 gap-3 items-end">
        <label className="form-control md:col-span-2">
          <span className="label-text">{t('Store ID') || 'Store ID'}</span>
          <input className="input input-bordered" value={storeId} onChange={(e)=>setStoreId(e.target.value)} placeholder={t('forms.store_id_placeholder') || 'e.g. 1'} />
        </label>
        <div className="flex gap-2">
          <a className={`btn ${!storeId?'btn-disabled':''}`} href={`${base}/shipping`}>{t('Shipping') || 'Shipping'}</a>
          <a className={`btn ${!storeId?'btn-disabled':''}`} href={`${base}/pickup`}>{t('Pickup') || 'Pickup'}</a>
          <a className={`btn ${!storeId?'btn-disabled':''}`} href={`${base}/payment`}>{t('Payment') || 'Payment'}</a>
        </div>
      </div>
      <p className="opacity-70 text-sm">{t('This uses the exact store shipping, pickup, and payment editors used by sellers, with admin permissions.') || 'This uses the exact store shipping, pickup, and payment editors used by sellers, with admin permissions.'}</p>
    </section>
  );
}

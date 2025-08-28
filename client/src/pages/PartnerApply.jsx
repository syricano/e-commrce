import { useState } from 'react';
import axiosInstance from '@/config/axiosConfig';
import { useLang } from '@/context/LangProvider';
import { toast } from 'react-hot-toast';
import usePageTitle from '@/hooks/usePageTitle';

export default function PartnerApply() {
  const { t } = useLang();
  usePageTitle('Become a Partner');
  const [f, setF] = useState({
    name: '', email: '', phone: '',
    businessField: '',
    shippingOptions: { shipping: false, pickup: false },
    payments: { cash: false, bank: false, online: false, invoice: false },
    message: '',
  });
  const [busy, setBusy] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setF((s) => ({ ...s, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        name: f.name.trim(),
        email: f.email.trim(),
        phone: f.phone.trim(),
        businessField: f.businessField.trim(),
        shippingOptions: Object.keys(f.shippingOptions).filter(k => f.shippingOptions[k]),
        preferredPayments: Object.keys(f.payments).filter(k => f.payments[k]),
        message: f.message.trim(),
      };
      await axiosInstance.post('/partners/inquiries', payload);
      toast.success(t('Submit'));
      setF({ name:'', email:'', phone:'', businessField:'', shippingOptions:{shipping:false,pickup:false}, payments:{cash:false,bank:false,online:false,invoice:false}, message:'' });
    } catch (e) {
      toast.error('Failed to send');
    } finally { setBusy(false); }
  };

  return (
    <section className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">{t('Partner with us')}</h1>
      <form className="grid gap-3" onSubmit={onSubmit}>
        <label className="form-control">
          <span className="label-text">{t('Name')}</span>
          <input className="input input-bordered" name="name" value={f.name} onChange={onChange} required />
        </label>
        <label className="form-control">
          <span className="label-text">{t('Email')}</span>
          <input className="input input-bordered" type="email" name="email" value={f.email} onChange={onChange} required />
        </label>
        <label className="form-control">
          <span className="label-text">{t('Phone')}</span>
          <input className="input input-bordered" name="phone" value={f.phone} onChange={onChange} required />
        </label>
        <label className="form-control">
          <span className="label-text">{t('Business Field')}</span>
          <input className="input input-bordered" name="businessField" value={f.businessField} onChange={onChange} placeholder="Fashion, Electronics, Agriculture, Home…" />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="font-semibold mb-1">{t('Shipping Options')}</div>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="checkbox" checked={f.shippingOptions.shipping} onChange={(e)=>setF(s=>({...s, shippingOptions:{...s.shippingOptions, shipping:e.target.checked}}))} />
              <span>Shipping</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="checkbox" checked={f.shippingOptions.pickup} onChange={(e)=>setF(s=>({...s, shippingOptions:{...s.shippingOptions, pickup:e.target.checked}}))} />
              <span>Pickup</span>
            </label>
          </div>
          <div>
            <div className="font-semibold mb-1">{t('Preferred Payments')}</div>
            {[
              ['cash','Cash'],
              ['bank','Bank Transfer'],
              ['online','Online Payment'],
              ['invoice','Invoice'],
            ].map(([key,label])=> (
              <label key={key} className="flex items-center gap-2">
                <input type="checkbox" className="checkbox" checked={f.payments[key]} onChange={(e)=>setF(s=>({...s, payments:{...s.payments, [key]:e.target.checked}}))} />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        <label className="form-control">
          <span className="label-text">{t('Message')}</span>
          <textarea className="textarea textarea-bordered" rows={4} value={f.message} onChange={(e)=>setF(s=>({...s, message:e.target.value}))} />
        </label>

        <div className="text-right">
          <button className="btn btn-primary" disabled={busy}>{busy ? '…' : t('Submit')}</button>
        </div>
      </form>
    </section>
  );
}


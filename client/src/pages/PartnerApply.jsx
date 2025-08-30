import { useState, useMemo } from 'react';
import axiosInstance from '@/config/axiosConfig';
import { useLang } from '@/context/LangProvider';
import { useAuth } from '@/context';
import { toast } from 'react-hot-toast';
import usePageTitle from '@/hooks/usePageTitle';
import { COUNTRIES, CITIES_BY_COUNTRY } from '@/services/geo';

export default function PartnerApply() {
  const { t } = useLang();
  const { user } = useAuth() || {};
  usePageTitle('Become a Partner');
  const BUSINESS_OPTIONS = [
    'Fashion & Apparel', 'Electronics', 'Computers', 'Mobile & Accessories', 'Automotive', 'Grocery',
    'Health & Beauty', 'Home & Garden', 'Furniture', 'Appliances', 'Books & Media', 'Baby',
    'Pet Supplies', 'Office & Stationery', 'Toys & Games', 'Sports & Outdoors', 'Jewelry & Accessories',
    'Cosmetics & Personal Care', 'Pharmacy', 'Bakery', 'Restaurant / Food Service', 'Industrial & Tools', 'Hardware'
  ];
  const [f, setF] = useState({
    name: '', email: '', phone: '',
    country: COUNTRIES[0],
    city: '',
    address: '',
    businessField: BUSINESS_OPTIONS[0],
    shippingOptions: { shipping: false, pickup: false },
    payments: { cash: false, bank: false, online: false, invoice: false },
    message: '',
  });
  const [busy, setBusy] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setF((s) => ({ ...s, [name]: value }));
  };

  const cities = useMemo(() => CITIES_BY_COUNTRY[f.country] || [], [f.country]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        userId: user?.id,
        name: f.name.trim(),
        email: f.email.trim(),
        phone: f.phone.trim(),
        businessField: f.businessField,
        country: f.country,
        city: f.city,
        address: f.address.trim(),
        shippingOptions: Object.keys(f.shippingOptions).filter(k => f.shippingOptions[k]),
        preferredPayments: Object.keys(f.payments).filter(k => f.payments[k]),
        message: f.message.trim(),
      };
      await axiosInstance.post('/partners/inquiries', payload);
      toast.success(t('Submit'));
      setF({ name:'', email:'', phone:'', country: COUNTRIES[0], city:'', address:'', businessField: BUSINESS_OPTIONS[0], shippingOptions:{shipping:false,pickup:false}, payments:{cash:false,bank:false,online:false,invoice:false}, message:'' });
    } catch (e) {
      toast.error(t('Failed to send'));
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

        {/* Address block above Business Field */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="form-control">
            <span className="label-text">{t('Country') || 'Country'}</span>
            <select
              className="select select-bordered"
              name="country"
              value={f.country}
              onChange={(e) => {
                const country = e.target.value;
                const list = CITIES_BY_COUNTRY[country] || [];
                setF(s => ({ ...s, country, city: list.includes(s.city) ? s.city : (list[0] || '') }));
              }}
            >
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>

          <label className="form-control">
            <span className="label-text">{t('City') || 'City'}</span>
            <select className="select select-bordered" name="city" value={f.city} onChange={onChange}>
              <option value="">{t('Select') || 'Select'}</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>

          <label className="form-control">
            <span className="label-text">{t('Address') || 'Address'}</span>
            <input className="input input-bordered" name="address" value={f.address} onChange={onChange} placeholder={t('Street / Building') || 'Street / Building'} />
          </label>
        </div>
        <label className="form-control">
          <span className="label-text">{t('Business Field')}</span>
          <select className="select select-bordered" name="businessField" value={f.businessField} onChange={onChange}>
            {BUSINESS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{t(opt) || opt}</option>
            ))}
          </select>
        </label>        

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="font-semibold mb-1">{t('Shipping Options')}</div>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="checkbox" checked={f.shippingOptions.shipping} onChange={(e)=>setF(s=>({...s, shippingOptions:{...s.shippingOptions, shipping:e.target.checked}}))} />
              <span>{t('Shipping') || 'Shipping'}</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="checkbox" checked={f.shippingOptions.pickup} onChange={(e)=>setF(s=>({...s, shippingOptions:{...s.shippingOptions, pickup:e.target.checked}}))} />
              <span>{t('Pickup') || 'Pickup'}</span>
            </label>
          </div>
          <div>
            <div className="font-semibold mb-1">{t('Preferred Payments')}</div>
            {[
              ['cash', t('Cash') || 'Cash'],
              ['bank', t('Bank Transfer') || 'Bank Transfer'],
              ['online', t('Online Payment') || 'Online Payment'],
              ['invoice', t('Invoice') || 'Invoice'],
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

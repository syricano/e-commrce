import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePageTitle from '@/hooks/usePageTitle';
import { useLang } from '@/context/LangProvider';
import { errorHandler } from '@/utils';
import { getCheckoutOptions, placeOrder } from '@/services/checkout';
import { toast } from 'react-hot-toast';
import { COUNTRIES, CITIES_BY_COUNTRY } from '@/services/geo';
import { useAuth } from '@/context';

export default function Checkout() {
  usePageTitle('Checkout');
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, loading: authLoading } = useAuth() || {};
  const [opts, setOpts] = useState({ shipping: [], payments: [], currency: 'EUR' });
  const [fulfillment, setFulfillment] = useState('shipping');
  const [address, setAddress] = useState({ country: 'SY', city: '', street: '', postalCode: '' });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [paymentDetails, setPaymentDetails] = useState({ cardNumber: '', cardExp: '', cardCvc: '', bankRef: '' });
  const [busy, setBusy] = useState(false);

  // Map a small set of ISO2 codes to the existing country names list
  const COUNTRY_CHOICES = [
    { code: 'SY', name: 'Syria' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'DE', name: 'Germany' },
    { code: 'GB', name: 'United Kingdom' },
  ];
  const citiesForCode = useMemo(() => {
    const rec = COUNTRY_CHOICES.find(c => c.code === address.country);
    const key = rec?.name || 'Syria';
    return CITIES_BY_COUNTRY[key] || [];
  }, [address.country]);

  // Ensure a default city is selected when country changes or on first load
  useEffect(() => {
    const rec = COUNTRY_CHOICES.find(c => c.code === address.country);
    const list = CITIES_BY_COUNTRY[rec?.name || 'Syria'] || [];
    if (!address.city && list.length > 0) {
      setAddress((a) => ({ ...a, city: list[0] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address.country]);

  // Redirect unauthenticated users to sign-in before checkout
  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated === false) {
      toast.error(t('Please sign in to checkout') || 'Please sign in to checkout');
      navigate(`/signin?next=${encodeURIComponent('/checkout')}`);
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (authLoading || isAuthenticated === false) return; // don't load options if not signed in or still loading
    let alive = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await getCheckoutOptions();
        const data = res?.data || res || {};
        if (!alive) return;
        setOpts(data);
        // choose default payment from first store (or fallback)
        const first = Array.isArray(data.payments) ? (data.payments[0]?.options || {}) : {};
        const methods = Array.isArray(first.methods) && first.methods.length ? first.methods : ['cod','bank_transfer'];
        setPaymentMethod(methods[0] || 'cod');
        // pick fulfillment if any store disables shipping
        const anyPickupOnly = (data.shipping || []).some(s => s?.options?.shippingEnabled === false);
        setFulfillment(anyPickupOnly ? 'pickup' : 'shipping');
      } catch (e) { errorHandler(e, t('Failed to start checkout') || 'Failed to start checkout'); }
      finally { if (alive) setLoading(false); }
    };
    load();
    return () => { alive = false; };
  }, [isAuthenticated, authLoading]);

  const submit = async () => {
    setBusy(true);
    try {
      const payload = { fulfillment, payment: { method: paymentMethod } };
      if (paymentMethod === 'card') {
        payload.payment.details = {
          cardNumber: paymentDetails.cardNumber || undefined,
          cardExp: paymentDetails.cardExp || undefined,
          cardCvc: paymentDetails.cardCvc || undefined,
        };
      } else if (paymentMethod === 'bank_transfer') {
        payload.payment.details = { reference: paymentDetails.bankRef || undefined };
      }
      if (fulfillment === 'shipping') payload.shippingAddress = address;
      const res = await placeOrder(payload);
      const out = res?.data || res || {};
      if (out?.orderId) {
        toast.success(t('Order placed') || 'Order placed');
        // Let mini cart refresh immediately
        try { window.dispatchEvent(new CustomEvent('cart:updated')); } catch {}
        // Always go to success page; it will show "View order" if logged in
        navigate(`/checkout/success`, { state: { order: out } });
      }
    } catch (e) { errorHandler(e, t('Failed to start checkout') || 'Failed to start checkout'); }
    finally { setBusy(false); }
  };

  return (
    <section className="p-4 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">{t('Checkout') || 'Checkout'}</h1>

      {loading ? (
        <div className="opacity-70">{t('Loading…') || 'Loading…'}</div>
      ) : (
        <>
          <div className="card bg-base-100 border"><div className="card-body grid md:grid-cols-2 gap-4">
            <div>
              <div className="font-semibold mb-2">{t('Fulfillment') || 'Fulfillment'}</div>
              <label className="flex items-center gap-2 mb-2">
                <input type="radio" name="fulf" className="radio" checked={fulfillment==='shipping'} onChange={()=>setFulfillment('shipping')} />
                <span>{t('Shipping') || 'Shipping'}</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="fulf" className="radio" checked={fulfillment==='pickup'} onChange={()=>setFulfillment('pickup')} />
                <span>{t('Pickup') || 'Pickup'}</span>
              </label>

              {fulfillment==='shipping' && (
                <div className="mt-4 space-y-2">
                  <label className="form-control">
                    <span className="label-text">{t('Country') || 'Country'}</span>
                    <select
                      className="select select-bordered"
                      value={address.country}
                      onChange={(e) => {
                        const code = e.target.value;
                        const rec = COUNTRY_CHOICES.find(c => c.code === code);
                        const list = CITIES_BY_COUNTRY[rec?.name || 'Syria'] || [];
                        setAddress(a => ({ ...a, country: code, city: list[0] || '' }));
                      }}
                    >
                      {COUNTRY_CHOICES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                  </label>
                  <label className="form-control">
                    <span className="label-text">{t('City') || 'City'}</span>
                    <select className="select select-bordered" value={address.city} onChange={e=>setAddress(a=>({...a, city:e.target.value}))}>
                      {citiesForCode.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </label>
                  <label className="form-control">
                    <span className="label-text">{t('Street') || 'Street'}</span>
                    <input className="input input-bordered" value={address.street} onChange={e=>setAddress(a=>({...a, street:e.target.value}))} />
                  </label>
                  <label className="form-control">
                    <span className="label-text">{t('Postal code') || 'Postal code'}</span>
                    <input className="input input-bordered" value={address.postalCode} onChange={e=>setAddress(a=>({...a, postalCode:e.target.value}))} />
                  </label>
                </div>
              )}
            </div>

            <div>
              <div className="font-semibold mb-2">{t('Payment') || 'Payment'}</div>
              <select className="select select-bordered w-full" value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)}>
                {Array.from(new Set((opts.payments||[]).flatMap(p => (p?.options?.methods || []))))
                  .map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              {/* Payment details by method */}
              {paymentMethod === 'card' && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <label className="form-control col-span-2">
                    <span className="label-text">{t('Card Number') || 'Card Number'}</span>
                    <input className="input input-bordered" placeholder={t('forms.card_number_placeholder') || '4242 4242 4242 4242'} value={paymentDetails.cardNumber} onChange={e=>setPaymentDetails(s=>({ ...s, cardNumber:e.target.value }))} />
                  </label>
                  <label className="form-control">
                    <span className="label-text">{t('Expiry') || 'Expiry'}</span>
                    <input className="input input-bordered" placeholder={t('forms.expiry_placeholder') || 'MM/YY'} value={paymentDetails.cardExp} onChange={e=>setPaymentDetails(s=>({ ...s, cardExp:e.target.value }))} />
                  </label>
                  <label className="form-control">
                    <span className="label-text">{t('CVC') || 'CVC'}</span>
                    <input className="input input-bordered" placeholder={t('forms.cvc_placeholder') || 'CVC'} value={paymentDetails.cardCvc} onChange={e=>setPaymentDetails(s=>({ ...s, cardCvc:e.target.value }))} />
                  </label>
                  <div className="col-span-2 opacity-70 text-sm">{t('Card entry is simulated for demo') || 'Card entry is simulated for demo'}</div>
                </div>
              )}
              {paymentMethod === 'bank_transfer' && (
                <div className="mt-3 space-y-2">
                  <div className="opacity-70 text-sm">
                    {(opts.payments?.[0]?.options?.bankTransfer?.bankName || '') && (
                      <div>{t('Bank') || 'Bank'}: {opts.payments[0].options.bankTransfer.bankName}</div>
                    )}
                    {(opts.payments?.[0]?.options?.bankTransfer?.iban || '') && (
                      <div>IBAN: {opts.payments[0].options.bankTransfer.iban}</div>
                    )}
                    {(opts.payments?.[0]?.options?.bankTransfer?.swift || '') && (
                      <div>SWIFT: {opts.payments[0].options.bankTransfer.swift}</div>
                    )}
                  </div>
                  <label className="form-control">
                    <span className="label-text">{t('Payment reference (optional)') || 'Payment reference (optional)'}</span>
                    <input className="input input-bordered" value={paymentDetails.bankRef} onChange={e=>setPaymentDetails(s=>({ ...s, bankRef:e.target.value }))} />
                  </label>
                </div>
              )}
              {paymentMethod === 'paypal' && (
                <div className="mt-3 opacity-70 text-sm">
                  {t('You will be contacted with PayPal instructions') || 'You will be contacted with PayPal instructions'}
                </div>
              )}
            </div>
          </div></div>

          <div className="text-right">
            <button className="btn btn-primary" onClick={submit} disabled={busy}>{busy ? t('Loading…') || 'Loading…' : (t('Place order') || 'Place order')}</button>
          </div>
        </>
      )}
    </section>
  );
}

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/config/axiosConfig';
import usePageTitle from '@/hooks/usePageTitle';
import StoreNav from '@/components/merchant/StoreNav.jsx';
import { errorHandler } from '@/utils';
import { useLang } from '@/context/LangProvider';

export default function StorePayment() {
  const { id } = useParams();
  usePageTitle('Store Payment');
  const { t } = useLang();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    methods: ['cod','bank_transfer'],
    cod: { enabled: true, feeAmount: 0, currency: 'EUR' },
    bankTransfer: { enabled: false, bankName: '', accountHolder: '', iban: '', swift: '', instructions: { ar: '' } },
    card: { enabled: false, provider: 'manual', publicKey: '', instructions: { ar: '' } },
    paypal: { enabled: false, merchantId: '', email: '', sandbox: true },
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/merchant/stores/${id}`);
      const s = res?.data || {};
      const p = s?.preferredPayments || {};
      setForm({
        methods: Array.isArray(p?.methods) && p.methods.length ? p.methods : ['cod','bank_transfer'],
        cod: { enabled: !!p?.cod?.enabled, feeAmount: Number(p?.cod?.feeAmount || 0), currency: p?.cod?.currency || 'EUR' },
        bankTransfer: {
          enabled: !!p?.bankTransfer?.enabled,
          bankName: p?.bankTransfer?.bankName || '',
          accountHolder: p?.bankTransfer?.accountHolder || '',
          iban: p?.bankTransfer?.iban || '',
          swift: p?.bankTransfer?.swift || '',
          instructions: p?.bankTransfer?.instructions || { ar: '' },
        },
        card: {
          enabled: !!p?.card?.enabled,
          provider: p?.card?.provider || 'manual',
          publicKey: p?.card?.publicKey || '',
          instructions: p?.card?.instructions || { ar: '' },
        },
        paypal: {
          enabled: !!p?.paypal?.enabled,
          merchantId: p?.paypal?.merchantId || '',
          email: p?.paypal?.email || '',
          sandbox: p?.paypal?.sandbox !== false,
        }
      });
    } catch (e) { errorHandler(e, t('Failed to load') || 'Failed to load'); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ load(); }, [id]);

  const toggleMethod = (key, on) => {
    setForm((f) => {
      const set = new Set(f.methods);
      if (on) set.add(key); else set.delete(key);
      return { ...f, methods: Array.from(set) };
    });
  };

  const save = async () => {
    try {
      await axiosInstance.put(`/merchant/stores/${id}/settings`, { preferredPayments: form });
      await load();
    } catch (e) { errorHandler(e, t('Failed to save') || 'Failed to save'); }
  };

  return (
    <section className="p-4 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">{t('Store')} {id} — {t('Payment')}</h1>
      <StoreNav />
      {loading ? (
        <div className="opacity-70">{t('Loading…') || 'Loading…'}</div>
      ) : (
        <div className="card bg-base-100 border"><div className="card-body space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="font-semibold mb-2">{t('Enable methods') || 'Enable methods'}</div>
              {[{k:'cod', label:'COD'},{k:'bank_transfer',label:'Bank Transfer'},{k:'card',label:'Card'},{k:'paypal',label:'PayPal'}].map(({k,label}) => (
                <label key={k} className="flex items-center gap-2 mb-2">
                  <input type="checkbox" className="toggle" checked={form.methods.includes(k)} onChange={(e)=>toggleMethod(k, e.target.checked)} />
                  <span>{label}</span>
                </label>
              ))}
            </div>

            <div>
              <div className="font-semibold mb-2">{t('Cash on delivery') || 'Cash on delivery'}</div>
              <label className="flex items-center gap-2 mb-2">
                <input type="checkbox" className="toggle" checked={form.cod.enabled} onChange={(e)=>setForm(f=>({ ...f, cod:{ ...f.cod, enabled:e.target.checked } }))} />
                <span>{t('Enable COD') || 'Enable COD'}</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="form-control">
                  <span className="label-text">{t('Fee (minor)') || 'Fee (minor)'}</span>
                  <input className="input input-bordered" inputMode="numeric" value={form.cod.feeAmount} onChange={e=>setForm(f=>({ ...f, cod:{ ...f.cod, feeAmount: Number(e.target.value||0) } }))} />
                </label>
                <label className="form-control">
                  <span className="label-text">{t('Currency') || 'Currency'}</span>
                  <input className="input input-bordered" value={form.cod.currency} onChange={e=>setForm(f=>({ ...f, cod:{ ...f.cod, currency:e.target.value.toUpperCase() } }))} />
                </label>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="font-semibold mb-2">{t('Bank transfer') || 'Bank transfer'}</div>
              <label className="flex items-center gap-2 mb-2">
                <input type="checkbox" className="toggle" checked={form.bankTransfer.enabled} onChange={(e)=>setForm(f=>({ ...f, bankTransfer:{ ...f.bankTransfer, enabled:e.target.checked } }))} />
                <span>{t('Enable') || 'Enable'}</span>
              </label>
              <div className="grid gap-2">
                {['bankName','accountHolder','iban','swift'].map(k => (
                  <label key={k} className="form-control">
                    <span className="label-text">{k}</span>
                    <input className="input input-bordered" value={form.bankTransfer[k]} onChange={e=>setForm(f=>({ ...f, bankTransfer:{ ...f.bankTransfer, [k]: e.target.value } }))} />
                  </label>
                ))}
                <label className="form-control">
                  <span className="label-text">{t('Instructions (AR)') || 'Instructions (AR)'}</span>
                  <textarea className="textarea textarea-bordered" value={form.bankTransfer.instructions?.ar || ''} onChange={e=>setForm(f=>({ ...f, bankTransfer:{ ...f.bankTransfer, instructions:{ ...(f.bankTransfer.instructions||{}), ar:e.target.value } } }))} />
                </label>
              </div>
            </div>

            <div>
              <div className="font-semibold mb-2">{t('Card') || 'Card'}</div>
              <label className="flex items-center gap-2 mb-2">
                <input type="checkbox" className="toggle" checked={form.card.enabled} onChange={(e)=>setForm(f=>({ ...f, card:{ ...f.card, enabled:e.target.checked } }))} />
                <span>{t('Enable') || 'Enable'}</span>
              </label>
              <div className="grid gap-2">
                <label className="form-control">
                  <span className="label-text">{t('Provider') || 'Provider'}</span>
                  <select className="select select-bordered" value={form.card.provider} onChange={e=>setForm(f=>({ ...f, card:{ ...f.card, provider:e.target.value } }))}>
                    {['manual','stripe','adyen'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </label>
                <label className="form-control">
                  <span className="label-text">{t('Public key') || 'Public key'}</span>
                  <input className="input input-bordered" value={form.card.publicKey} onChange={e=>setForm(f=>({ ...f, card:{ ...f.card, publicKey:e.target.value } }))} />
                </label>
                <label className="form-control">
                  <span className="label-text">{t('Instructions (AR)') || 'Instructions (AR)'}</span>
                  <textarea className="textarea textarea-bordered" value={form.card.instructions?.ar || ''} onChange={e=>setForm(f=>({ ...f, card:{ ...f.card, instructions:{ ...(f.card.instructions||{}), ar:e.target.value } } }))} />
                </label>
              </div>
            </div>
          </div>

          <div>
            <div className="font-semibold mb-2">PayPal</div>
            <label className="flex items-center gap-2 mb-2">
              <input type="checkbox" className="toggle" checked={form.paypal.enabled} onChange={(e)=>setForm(f=>({ ...f, paypal:{ ...f.paypal, enabled:e.target.checked } }))} />
              <span>{t('Enable') || 'Enable'}</span>
            </label>
            <div className="grid md:grid-cols-3 gap-2">
              <label className="form-control">
                <span className="label-text">merchantId</span>
                <input className="input input-bordered" value={form.paypal.merchantId} onChange={e=>setForm(f=>({ ...f, paypal:{ ...f.paypal, merchantId:e.target.value } }))} />
              </label>
              <label className="form-control">
                <span className="label-text">email</span>
                <input className="input input-bordered" value={form.paypal.email} onChange={e=>setForm(f=>({ ...f, paypal:{ ...f.paypal, email:e.target.value } }))} />
              </label>
              <label className="form-control">
                <span className="label-text">sandbox</span>
                <input type="checkbox" className="toggle" checked={form.paypal.sandbox} onChange={e=>setForm(f=>({ ...f, paypal:{ ...f.paypal, sandbox:e.target.checked } }))} />
              </label>
            </div>
          </div>

          <div className="text-right"><button className="btn btn-primary" onClick={save}>{t('save') || 'Save'}</button></div>
        </div></div>
      )}
    </section>
  );
}

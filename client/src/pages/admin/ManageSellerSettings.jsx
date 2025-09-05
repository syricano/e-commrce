import { useEffect, useMemo, useState } from 'react';
import { errorHandler } from '@/utils';
import { useLang } from '@/context/LangProvider';
import { adminGetSellerSettings, adminUpdateSellerSettings } from '@/services/admin';

// Minimal ISO2 country options
const ISO2 = [
  { code: 'SY', name: 'Syria' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'DE', name: 'Germany' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'FR', name: 'France' },
];

const currencies = ['SYP', 'EUR', 'USD', 'GBP', 'AED', 'SAR'];

const emptySettings = () => ({
  shippingOptions: {
    pickupEnabled: true,
    shippingEnabled: true,
    pickupAddresses: [],
    pickupPoints: [],
    pickupTimes: [],
    boxes: [],
    zones: [],
  },
  preferredPayments: {
    methods: ['cod','bank_transfer'],
    cod: { enabled: true, feeAmount: 0, currency: 'EUR' },
    bankTransfer: { enabled: false },
    card: { enabled: false, provider: 'manual' },
    paypal: { enabled: false, sandbox: true },
  },
});

export default function ManageSellerSettings() {
  const { t } = useLang();
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(emptySettings());
  const [showAdvanced, setShowAdvanced] = useState(false);

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await adminGetSellerSettings(userId);
      const data = res?.data || res || {};
      setSettings({
        shippingOptions: { ...emptySettings().shippingOptions, ...(data.shippingOptions || {}) },
        preferredPayments: { ...emptySettings().preferredPayments, ...(data.preferredPayments || {}) },
      });
    } catch (e) { errorHandler(e, t('Failed to load') || 'Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { /* no-op */ }, []);

  const save = async () => {
    try {
      // Ensure name objects exist for methods/zones
      const payload = JSON.parse(JSON.stringify(settings));
      for (const z of payload.shippingOptions.zones || []) {
        if (!z.name || typeof z.name !== 'object') z.name = { en: 'Zone' };
        for (const m of z.methods || []) {
          if (!m.name || typeof m.name !== 'object') m.name = { en: 'Shipping' };
        }
      }
      await adminUpdateSellerSettings(userId, payload);
      await load();
    } catch (e) { errorHandler(e, t('Failed to save') || 'Failed to save'); }
  };

  const so = settings.shippingOptions;
  const pp = settings.preferredPayments;

  // Helpers
  const updateSO = (patch) => setSettings((s) => ({ ...s, shippingOptions: { ...s.shippingOptions, ...patch } }));
  const updatePP = (patch) => setSettings((s) => ({ ...s, preferredPayments: { ...s.preferredPayments, ...patch } }));

  // Working copies of first zone and first method for a simple UX
  const firstZone = useMemo(() => so.zones?.[0] || { id: 'z1', name: { en: 'Default Zone' }, countries: [], cities: [], methods: [] }, [so.zones]);
  const firstMethod = useMemo(() => firstZone.methods?.[0] || { id: 'm1', name: { en: 'Standard' }, flatAmount: 0, perItemAmount: 0, currency: 'EUR' }, [firstZone]);

  const setFirstZone = (z) => {
    const zones = [...(so.zones || [])];
    if (zones.length === 0) zones.push(z); else zones[0] = z;
    updateSO({ zones });
  };
  const setFirstMethod = (m) => {
    const z = { ...firstZone, methods: (firstZone.methods?.length ? [m] : [m]) };
    setFirstZone(z);
  };

  return (
    <section className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">{t('Seller Settings') || 'Seller Settings'}</h1>
      <div className="flex items-end gap-2">
        <label className="form-control">
          <span className="label-text">{t('User ID') || 'User ID'}</span>
          <input className="input input-bordered" value={userId} onChange={e=>setUserId(e.target.value)} placeholder={t('forms.user_id_placeholder') || 'e.g. 123'} />
        </label>
        <button className="btn" onClick={load} disabled={!userId || loading}>{t('Load') || 'Load'}</button>
      </div>

      {/* Shipping & Pickup */}
      <div className="card bg-base-100 border"><div className="card-body grid md:grid-cols-2 gap-4">
        <div>
          <div className="font-semibold mb-2">{t('Shipping & Pickup') || 'Shipping & Pickup'}</div>
          <label className="label cursor-pointer">
            <span className="label-text">{t('Enable Shipping') || 'Enable Shipping'}</span>
            <input type="checkbox" className="toggle" checked={so.shippingEnabled !== false} onChange={(e)=>updateSO({ shippingEnabled: !!e.target.checked })} />
          </label>
          <label className="label cursor-pointer">
            <span className="label-text">{t('Enable Pickup') || 'Enable Pickup'}</span>
            <input type="checkbox" className="toggle" checked={so.pickupEnabled !== false} onChange={(e)=>updateSO({ pickupEnabled: !!e.target.checked })} />
          </label>
        </div>

        <div>
          <div className="font-semibold mb-2">{t('Zone') || 'Zone'}</div>
          <label className="form-control">
            <span className="label-text">{t('Countries') || 'Countries'}</span>
            <select multiple className="select select-bordered h-32" value={firstZone.countries} onChange={(e)=>{
              const vals = Array.from(e.target.selectedOptions).map(o=>o.value);
              setFirstZone({ ...firstZone, countries: vals });
            }}>
              {ISO2.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </label>
          <label className="form-control">
            <span className="label-text">{t('Cities (comma-separated)') || 'Cities (comma-separated)'}</span>
            <input className="input input-bordered" value={(firstZone.cities||[]).join(', ')} onChange={(e)=>setFirstZone({ ...firstZone, cities: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} />
          </label>
        </div>

        <div className="md:col-span-2">
          <div className="font-semibold mb-2">{t('Shipping Method') || 'Shipping Method'}</div>
          <div className="grid md:grid-cols-4 gap-3">
            <label className="form-control">
              <span className="label-text">{t('Name') || 'Name'}</span>
              <input className="input input-bordered" value={firstMethod.name?.en || ''} onChange={(e)=>setFirstMethod({ ...firstMethod, name: { en: e.target.value } })} />
            </label>
            <label className="form-control">
              <span className="label-text">{t('Flat Amount') || 'Flat Amount'}</span>
              <input type="number" min="0" step="1" className="input input-bordered" value={firstMethod.flatAmount ?? 0} onChange={(e)=>setFirstMethod({ ...firstMethod, flatAmount: Math.max(0, Math.round(+e.target.value || 0)) })} />
            </label>
            <label className="form-control">
              <span className="label-text">{t('Per Item') || 'Per Item'}</span>
              <input type="number" min="0" step="1" className="input input-bordered" value={firstMethod.perItemAmount ?? 0} onChange={(e)=>setFirstMethod({ ...firstMethod, perItemAmount: Math.max(0, Math.round(+e.target.value || 0)) })} />
            </label>
            <label className="form-control">
              <span className="label-text">{t('Currency') || 'Currency'}</span>
              <select className="select select-bordered" value={firstMethod.currency || 'EUR'} onChange={(e)=>setFirstMethod({ ...firstMethod, currency: e.target.value })}>
                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          </div>
        </div>
      </div></div>

      {/* Payments */}
      <div className="card bg-base-100 border"><div className="card-body">
        <div className="font-semibold mb-2">{t('Payments') || 'Payments'}</div>
        <div className="grid md:grid-cols-3 gap-3">
          <label className="form-control">
            <span className="label-text">{t('Allowed Methods') || 'Allowed Methods'}</span>
            <select multiple className="select select-bordered h-32" value={pp.methods || []} onChange={(e)=>updatePP({ methods: Array.from(e.target.selectedOptions).map(o=>o.value) })}>
              {['cod','bank_transfer','card','paypal'].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
          <label className="form-control">
            <span className="label-text">{t('COD Fee (minor)') || 'COD Fee (minor)'}</span>
            <input type="number" min="0" step="1" className="input input-bordered" value={pp.cod?.feeAmount ?? 0} onChange={(e)=>updatePP({ cod: { ...(pp.cod||{}), feeAmount: Math.max(0, Math.round(+e.target.value || 0)) } })} />
          </label>
          <label className="form-control">
            <span className="label-text">{t('COD Currency') || 'COD Currency'}</span>
            <select className="select select-bordered" value={pp.cod?.currency || 'EUR'} onChange={(e)=>updatePP({ cod: { ...(pp.cod||{}), currency: e.target.value } })}>
              {currencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>

        <div className="grid md:grid-cols-2 gap-3 mt-3">
          <label className="form-control">
            <span className="label-text">{t('Bank Name') || 'Bank Name'}</span>
            <input className="input input-bordered" value={pp.bankTransfer?.bankName || ''} onChange={(e)=>updatePP({ bankTransfer: { ...(pp.bankTransfer||{}), bankName: e.target.value } })} />
          </label>
          <label className="form-control">
            <span className="label-text">{t('Account Holder') || 'Account Holder'}</span>
            <input className="input input-bordered" value={pp.bankTransfer?.accountHolder || ''} onChange={(e)=>updatePP({ bankTransfer: { ...(pp.bankTransfer||{}), accountHolder: e.target.value } })} />
          </label>
          <label className="form-control">
            <span className="label-text">IBAN</span>
            <input className="input input-bordered" value={pp.bankTransfer?.iban || ''} onChange={(e)=>updatePP({ bankTransfer: { ...(pp.bankTransfer||{}), iban: e.target.value } })} />
          </label>
          <label className="form-control">
            <span className="label-text">SWIFT</span>
            <input className="input input-bordered" value={pp.bankTransfer?.swift || ''} onChange={(e)=>updatePP({ bankTransfer: { ...(pp.bankTransfer||{}), swift: e.target.value } })} />
          </label>
        </div>
      </div></div>

      {/* Advanced JSON toggle */}
      <details className="border rounded-lg">
        <summary className="cursor-pointer px-3 py-2">{t('Advanced (JSON)') || 'Advanced (JSON)'}</summary>
        <div className="grid md:grid-cols-2 gap-3 p-3">
          <label className="form-control">
            <span className="label-text">{t('Shipping Options (JSON)') || 'Shipping Options (JSON)'}</span>
            <textarea className="textarea textarea-bordered font-mono text-xs min-h-[260px]" value={JSON.stringify(so, null, 2)} onChange={(e)=>{
              try { updateSO(JSON.parse(e.target.value)); } catch {}
            }} />
          </label>
          <label className="form-control">
            <span className="label-text">{t('Preferred Payments (JSON)') || 'Preferred Payments (JSON)'}</span>
            <textarea className="textarea textarea-bordered font-mono text-xs min-h-[260px]" value={JSON.stringify(pp, null, 2)} onChange={(e)=>{
              try { updatePP(JSON.parse(e.target.value)); } catch {}
            }} />
          </label>
        </div>
      </details>

      <div className="text-right">
        <button className="btn btn-primary" onClick={save} disabled={!userId}>{t('save') || 'Save'}</button>
      </div>
    </section>
  );
}

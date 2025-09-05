// StoreShipping.jsx
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/config/axiosConfig';
import usePageTitle from '@/hooks/usePageTitle';
import StoreNav from '@/components/merchant/StoreNav.jsx';
import { errorHandler } from '@/utils';
import { useLang } from '@/context/LangProvider';
import { CITIES_BY_COUNTRY } from '@/services/geo';

const pretty = (obj) => {
  try { return JSON.stringify(obj ?? {}, null, 2); } catch { return ''; }
};
const parseJson = (s) => { try { return JSON.parse(s || '{}'); } catch { return {}; } };

export default function StoreShipping() {
  const { id } = useParams();
  usePageTitle('Store Shipping');
  const { t } = useLang();
  const [loading, setLoading] = useState(true);
  const [opts, setOpts] = useState({ shippingEnabled: true, boxes: [], zones: [] });
  const CURRENCIES = ['SYP','EUR','USD','SAR','AED','GBP'];

  const COUNTRY_CHOICES = [
    { code: 'SY', name: 'Syria' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'DE', name: 'Germany' },
    { code: 'GB', name: 'United Kingdom' },
  ];
  const [newZone, setNewZone] = useState({ id: 'zone1', nameAr: '', country: 'SY', city: '' });
  const citiesForNewZone = useMemo(() => {
    const rec = COUNTRY_CHOICES.find(c => c.code === newZone.country);
    return CITIES_BY_COUNTRY[rec?.name || 'Syria'] || [];
  }, [newZone.country]);
  const [methodForms, setMethodForms] = useState({}); // by zone index

  // Packaging presets
  const [pkgForm, setPkgForm] = useState({ id: 'box1', nameAr: '', lengthMm: 0, widthMm: 0, heightMm: 0, maxWeightGrams: 0, extraAmount: 0, currency: 'EUR' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/merchant/stores/${id}`);
      const s = res?.data || {};
      const o = s?.shippingOptions || {};
      const next = {
        shippingEnabled: o?.shippingEnabled !== false,
        boxes: Array.isArray(o?.boxes) ? o.boxes : [],
        zones: Array.isArray(o?.zones) ? o.zones : [],
      };
      setOpts(next);
    } catch (e) { errorHandler(e, t('Failed to load') || 'Failed to load'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]);

  const save = async () => {
    const payload = {
      shippingOptions: {
        shippingEnabled: !!opts.shippingEnabled,
        boxes: opts.boxes || [],
        zones: opts.zones || [],
      }
    };
    try {
      await axiosInstance.put(`/merchant/stores/${id}/settings`, payload);
      await load();
    } catch (e) { errorHandler(e, t('Failed to save') || 'Failed to save'); }
  };

  return (
    <section className="p-4 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">{t('Store')} {id} — {t('Store Shipping') || t('Shipping')}</h1>
      <StoreNav />
      {loading ? (
        <div className="opacity-70">{t('Loading…') || 'Loading…'}</div>
      ) : (
        <div className="card bg-base-100 border"><div className="card-body space-y-4">
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="toggle" checked={opts.shippingEnabled} onChange={e=>setOpts(o=>({...o, shippingEnabled:e.target.checked}))} />
              <span>{t('Enable Shipping') || 'Enable Shipping'}</span>
            </label>
          </div>

          {/* Friendly zone builder */}
          <div className="border rounded p-3">
            <div className="font-semibold mb-2">{t('Add shipping zone') || 'Add shipping zone'}</div>
            <div className="grid md:grid-cols-4 gap-2">
              <label className="form-control">
                <span className="label-text">{t('Zone ID') || 'Zone ID'}</span>
                <input className="input input-bordered" value={newZone.id} onChange={e=>setNewZone(z=>({...z, id:e.target.value}))} />
              </label>
              <label className="form-control">
                <span className="label-text">{t('Name (AR)') || 'Name (AR)'}</span>
                <input className="input input-bordered" value={newZone.nameAr} onChange={e=>setNewZone(z=>({...z, nameAr:e.target.value}))} />
              </label>
              <label className="form-control">
                <span className="label-text">{t('Country') || 'Country'}</span>
                <select
                  className="select select-bordered"
                  value={newZone.country}
                  onChange={(e)=>{
                    const code=e.target.value;
                    const rec=COUNTRY_CHOICES.find(c=>c.code===code);
                    const list=CITIES_BY_COUNTRY[rec?.name||'Syria']||[];
                    setNewZone(z=>({...z, country:code, city:list[0]||''}));
                  }}>
                  {COUNTRY_CHOICES.map(c => <option key={c.code} value={c.code}>{t(c.name) || c.name}</option>)}
                </select>
              </label>
              <label className="form-control">
                <span className="label-text">{t('City') || 'City'}</span>
                <select className="select select-bordered" value={newZone.city} onChange={e=>setNewZone(z=>({...z, city:e.target.value}))}>
                  {citiesForNewZone.map(c => <option key={c} value={c}>{t(c) || c}</option>)}
                </select>
              </label>
            </div>
            <div className="text-right mt-2">
              <button
                className="btn btn-sm"
                onClick={() => {
                  const zone = {
                    id: newZone.id || `zone-${Date.now()}`,
                    name: { ar: newZone.nameAr || newZone.city || newZone.country },
                    countries: [],
                    cities: newZone.city ? [newZone.city] : [],
                    methods: [],
                  };
                  setOpts(o => ({ ...o, zones: [...(o.zones||[]), zone] }));
                }}
              >{t('Add') || 'Add'}</button>
            </div>
          </div>

          {/* Zones list with method adders */}
          <div className="space-y-3">
            {(opts.zones || []).map((z, zi) => (
              <div key={zi} className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{z.name?.ar || z.id}</div>
                  <button className="btn btn-ghost btn-xs" onClick={()=> setOpts(o=>({ ...o, zones: (o.zones||[]).filter((_,i)=>i!==zi) }))}>{t('Remove') || 'Remove'}</button>
                </div>
                <div className="opacity-70 text-sm mb-2">{[...(z.countries||[]), ...(z.cities||[])].join(' • ')}</div>
                <div className="grid md:grid-cols-5 gap-2 items-end">
                  <label className="form-control">
                    <span className="label-text">{t('Method ID') || 'Method ID'}</span>
                    <input className="input input-bordered" value={methodForms[zi]?.id || ''} onChange={e=>setMethodForms(m=>({ ...m, [zi]: { ...(m[zi]||{}), id:e.target.value } }))} />
                  </label>
                  <label className="form-control">
                    <span className="label-text">{t('Name (AR)') || 'Name (AR)'}</span>
                    <input className="input input-bordered" value={methodForms[zi]?.nameAr || ''} onChange={e=>setMethodForms(m=>({ ...m, [zi]: { ...(m[zi]||{}), nameAr:e.target.value } }))} />
                  </label>
                  <label className="form-control">
                    <span className="label-text">{t('Flat amount') || 'Flat amount'}</span>
                    <input className="input input-bordered" inputMode="numeric" value={methodForms[zi]?.flatAmount || 0} onChange={e=>setMethodForms(m=>({ ...m, [zi]: { ...(m[zi]||{}), flatAmount:Number(e.target.value||0) } }))} />
                  </label>
                  <label className="form-control">
                    <span className="label-text">{t('Per item') || 'Per item'}</span>
                    <input className="input input-bordered" inputMode="numeric" value={methodForms[zi]?.perItemAmount || 0} onChange={e=>setMethodForms(m=>({ ...m, [zi]: { ...(m[zi]||{}), perItemAmount:Number(e.target.value||0) } }))} />
                  </label>
                  <label className="form-control">
                    <span className="label-text">{t('Currency') || 'Currency'}</span>
                    <select className="select select-bordered" value={methodForms[zi]?.currency || opts?.currency || 'EUR'} onChange={e=>setMethodForms(m=>({ ...m, [zi]: { ...(m[zi]||{}), currency:e.target.value } }))}>
                      {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </label>
                </div>
                <div className="text-right mt-2">
                  <button className="btn btn-xs" onClick={() => {
                    const f = methodForms[zi] || {};
                    const method = { id: f.id || `m-${Date.now()}`, name: { ar: f.nameAr || f.id || t('Method') || 'Method' }, flatAmount: Number(f.flatAmount||0), perItemAmount: Number(f.perItemAmount||0), currency: f.currency || 'EUR' };
                    setOpts(o => {
                      const next = [...(o.zones||[])];
                      next[zi] = { ...(next[zi]||{}), methods: [...(next[zi]?.methods||[]), method] };
                      return { ...o, zones: next };
                    });
                    setMethodForms(m => ({ ...m, [zi]: {} }));
                  }}>{t('Add method') || 'Add method'}</button>
                </div>

                {(z.methods||[]).length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {z.methods.map((m, mi) => (
                      <li key={mi} className="flex items-center justify-between border rounded px-2 py-1 text-sm">
                        <div>{m.name?.ar || m.id} — {m.flatAmount}+{m.perItemAmount}/{t('item') || 'item'} {m.currency}</div>
                        <button className="btn btn-ghost btn-xs" onClick={()=> setOpts(o=>{
                          const next=[...(o.zones||[])];
                          next[zi] = { ...(next[zi]||{}), methods: (next[zi]?.methods||[]).filter((_,i)=>i!==mi) };
                          return { ...o, zones: next };
                        })}>{t('Remove') || 'Remove'}</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* Packaging presets */}
          <div className="border rounded p-3">
            <div className="font-semibold mb-2">{t('Add package preset') || 'Add package preset'}</div>
            <div className="grid md:grid-cols-7 gap-2 items-end">
              <label className="form-control">
                <span className="label-text">{t('ID') || 'ID'}</span>
                <input className="input input-bordered" value={pkgForm.id} onChange={e=>setPkgForm(p=>({...p, id:e.target.value}))} />
              </label>
              <label className="form-control">
                <span className="label-text">{t('Name (AR)') || 'Name (AR)'}</span>
                <input className="input input-bordered" value={pkgForm.nameAr} onChange={e=>setPkgForm(p=>({...p, nameAr:e.target.value}))} />
              </label>
              {['lengthMm','widthMm','heightMm','maxWeightGrams','extraAmount'].map(k => (
                <label key={k} className="form-control">
                  <span className="label-text">{t(k) || k}</span>
                  <input className="input input-bordered" inputMode="numeric" value={pkgForm[k]} onChange={e=>setPkgForm(p=>({...p, [k]: Number(e.target.value||0)}))} />
                </label>
              ))}
              <label className="form-control">
                <span className="label-text">{t('Currency') || 'Currency'}</span>
                <select className="select select-bordered" value={pkgForm.currency} onChange={e=>setPkgForm(p=>({...p, currency:e.target.value}))}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
            </div>
            <div className="text-right mt-2">
              <button className="btn btn-sm" onClick={() => {
                const box = { id: pkgForm.id || `box-${Date.now()}`, name: { ar: pkgForm.nameAr || pkgForm.id }, lengthMm: pkgForm.lengthMm||0, widthMm: pkgForm.widthMm||0, heightMm: pkgForm.heightMm||0, maxWeightGrams: pkgForm.maxWeightGrams||0, extraAmount: pkgForm.extraAmount||0, currency: pkgForm.currency||'EUR' };
                setOpts(o => ({ ...o, boxes: [...(o.boxes||[]), box] }));
                setPkgForm({ id: 'box1', nameAr: '', lengthMm: 0, widthMm: 0, heightMm: 0, maxWeightGrams: 0, extraAmount: 0, currency: 'EUR' });
              }}>{t('Add') || 'Add'}</button>
            </div>
            {(opts.boxes||[]).length > 0 && (
              <ul className="mt-2 space-y-1">
                {opts.boxes.map((b, bi) => (
                  <li key={bi} className="flex items-center justify-between border rounded px-2 py-1 text-sm">
                    <div>{b.name?.ar || b.id} — {b.lengthMm}×{b.widthMm}×{b.heightMm} mm, {b.maxWeightGrams} g, +{b.extraAmount} {b.currency}</div>
                    <button className="btn btn-ghost btn-xs" onClick={()=> setOpts(o=>({ ...o, boxes:(o.boxes||[]).filter((_,i)=>i!==bi) }))}>{t('Remove') || 'Remove'}</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="text-right"><button className="btn btn-primary" onClick={save}>{t('save') || 'Save'}</button></div>
        </div></div>
      )}
    </section>
  );
}

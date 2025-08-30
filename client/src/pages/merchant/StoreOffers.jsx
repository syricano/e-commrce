import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import usePageTitle from '@/hooks/usePageTitle';
import axiosInstance from '@/config/axiosConfig';
import StoreNav from '@/components/merchant/StoreNav.jsx';
import { errorHandler } from '@/utils';
import { useLang } from '@/context/LangProvider';

export default function StoreOffers() {
  const { id } = useParams();
  usePageTitle('Store Offers');
  const storeId = id;
  const { t } = useLang();
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [f, setF] = useState({ storeProductId: '', compareAtAmount: '', discountPct: 10, priceAmount: '', currency: 'EUR', stockOnHand: 0 });
  const [priceTouched, setPriceTouched] = useState(false);
  const DISCOUNTS = Array.from({ length: 15 }, (_, i) => (i + 1) * 5); // 5..75
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [pRes, oRes] = await Promise.all([
        axiosInstance.get('/store-products', { params: { storeId } }),
        axiosInstance.get('/store-offers', { params: { storeId } }),
      ]);
      setProducts(pRes?.data || []);
      setOffers(oRes?.data || []);
    } catch (e) { errorHandler(e, t('Failed to load') || 'Failed to load'); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ if (storeId) load(); }, [storeId]);

  // Index last offer per product for auto-fill
  const lastByProduct = useMemo(() => {
    const by = new Map();
    for (const o of offers) {
      const pid = o?.product?.id;
      if (pid) {
        const cur = by.get(pid);
        if (!cur || (o.id > cur.id)) by.set(pid, o);
      }
    }
    return by;
  }, [offers]);

  const onCreate = async () => {
    const base = Number(f.compareAtAmount);
    const price = Number(f.priceAmount);
    if (!f.storeProductId || isNaN(base) || base <= 0 || isNaN(price) || price < 0) return;
    const payload = {
      storeProductId: Number(f.storeProductId),
      compareAtAmount: base,
      priceAmount: Math.round(price),
      currency: f.currency,
      stockOnHand: Number(f.stockOnHand) || 0,
    };
    try { await axiosInstance.post('/store-offers', payload); setF({ storeProductId:'', compareAtAmount:'', discountPct:10, priceAmount:'', currency:'EUR', stockOnHand:0 }); setPriceTouched(false); await load(); }
    catch (e) { errorHandler(e, t('Create failed') || 'Create failed'); }
  };

  return (
    <section className="p-4 space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">{t('Store')} {storeId} — {t('Offers') || 'Offers'}</h1>
      <StoreNav />
      <div className="card bg-base-100 border">
        <div className="card-body grid md:grid-cols-6 gap-3">
          <label className="form-control md:col-span-2">
            <span className="label-text">{t('Product') || 'Product'}</span>
            <select className="select select-bordered" value={f.storeProductId} onChange={(e)=>{
              const val = e.target.value;
              setF(s=>{
                const next = { ...s, storeProductId: val };
                const pid = Number(val);
                const last = products && offers ? lastByProduct.get(pid) : null;
                if (last) {
                  const base = Number(last.compareAtAmount || last.priceAmount || 0) || '';
                  next.compareAtAmount = base === '' ? '' : String(base);
                  next.stockOnHand = Number.isFinite(Number(last.stockOnHand)) ? Number(last.stockOnHand) : 0;
                  // Compute a default discounted price when selecting a product
                  const pct = Number(next.discountPct) || 0;
                  const computed = base ? Math.max(0, Math.round(Number(base) * (1 - pct/100))) : '';
                  next.priceAmount = computed === '' ? '' : String(computed);
                }
                setPriceTouched(false);
                return next;
              });
            }}>
              <option value="">{t('Select product') || '— select product —'}</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (SKU {p.articleNumber})</option>)}
            </select>
          </label>
          <label className="form-control">
            <span className="label-text">{t('Original Price') || 'Original Price'}</span>
            <input className="input input-bordered" type="number" min="0" value={f.compareAtAmount} onChange={(e)=>{
              const v = e.target.value;
              setF(s=>{
                const next = { ...s, compareAtAmount: v };
                if (!priceTouched) {
                  const base = Number(v);
                  const pct = Number(next.discountPct) || 0;
                  next.priceAmount = isNaN(base) ? '' : String(Math.max(0, Math.round(base * (1 - pct/100))));
                }
                return next;
              });
            }} />
          </label>
          <label className="form-control">
            <span className="label-text">{t('Discount') || 'Discount'}</span>
            <select className="select select-bordered" value={f.discountPct} onChange={(e)=>{
              const d = Number(e.target.value);
              setF(s=>{
                const next = { ...s, discountPct: d };
                if (!priceTouched) {
                  const base = Number(next.compareAtAmount);
                  next.priceAmount = isNaN(base) ? '' : String(Math.max(0, Math.round(base * (1 - d/100))));
                }
                return next;
              });
            }}>
              {DISCOUNTS.map(d => <option key={d} value={d}>{d}%</option>)}
            </select>
          </label>
          <label className="form-control">
            <span className="label-text">{t('Final Price') || 'Final Price'}</span>
            <input className="input input-bordered" type="number" min="0" value={f.priceAmount} onChange={(e)=>{ setPriceTouched(true); setF(s=>({...s, priceAmount:e.target.value})); }} />
          </label>
          <label className="form-control">
            <span className="label-text">{t('Currency') || 'Currency'}</span>
            <select className="select select-bordered" value={f.currency} onChange={(e)=>setF(s=>({...s, currency:e.target.value}))}>
              {['EUR','USD','GBP','AED','SAR'].map(c=>(<option key={c} value={c}>{c}</option>))}
            </select>
          </label>
          <label className="form-control">
            <span className="label-text">{t('Stock') || 'Stock'}</span>
            <input className="input input-bordered" type="number" min="0" value={f.stockOnHand} onChange={(e)=>setF(s=>({...s, stockOnHand:e.target.value}))} />
          </label>
          <div className="md:col-span-4 text-right">
            <button className="btn btn-primary" onClick={onCreate}>{t('Add Offer') || 'Add Offer'}</button>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 border">
        <div className="card-body">
          {loading && <div className="opacity-60">{t('Loading…') || 'Loading…'}</div>}
          {!loading && offers.length === 0 && <div className="opacity-60">{t('No offers') || 'No offers'}</div>}
          {!loading && offers.length > 0 && (
            <ul className="divide-y">
              {offers.map(o => (
                <li key={o.id} className="py-2 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{o.product?.name}</div>
                    <div className="text-xs opacity-70">SKU: {o.product?.articleNumber}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="opacity-70 text-sm">{o.priceAmount} {o.currency} • {t('Stock') || 'Stock'} {o.stockOnHand}</div>
                    <button className="btn btn-ghost btn-xs" onClick={async()=>{ if (confirm(t('Delete offer?') || 'Delete offer?')) { try{ await axiosInstance.delete(`/store-offers/${o.id}`); await load(); } catch(e){ errorHandler(e, t('Delete failed') || 'Delete failed'); } } }}>{t('Delete') || 'Delete'}</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

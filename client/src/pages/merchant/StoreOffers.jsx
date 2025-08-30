import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import usePageTitle from '@/hooks/usePageTitle';
import axiosInstance from '@/config/axiosConfig';
import { errorHandler } from '@/utils';
import { useLang } from '@/context/LangProvider';

export default function StoreOffers() {
  const { id } = useParams();
  usePageTitle('Store Offers');
  const storeId = id;
  const { t } = useLang();
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [f, setF] = useState({ storeProductId: '', priceAmount: '', currency: 'EUR', stockOnHand: 0 });
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

  const onCreate = async () => {
    const payload = { ...f, storeProductId: Number(f.storeProductId), priceAmount: Number(f.priceAmount), stockOnHand: Number(f.stockOnHand) };
    if (!payload.storeProductId || isNaN(payload.priceAmount)) return;
    try { await axiosInstance.post('/store-offers', payload); setF({ storeProductId:'', priceAmount:'', currency:'EUR', stockOnHand:0 }); await load(); }
    catch (e) { errorHandler(e, t('Create failed') || 'Create failed'); }
  };

  return (
    <section className="p-4 space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">{t('Store')} {storeId} — {t('Offers') || 'Offers'}</h1>
      <div className="card bg-base-100 border">
        <div className="card-body grid md:grid-cols-4 gap-3">
          <label className="form-control md:col-span-2">
            <span className="label-text">{t('Product') || 'Product'}</span>
            <select className="select select-bordered" value={f.storeProductId} onChange={(e)=>setF(s=>({...s, storeProductId:e.target.value}))}>
              <option value="">{t('Select product') || '— select product —'}</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (SKU {p.articleNumber})</option>)}
            </select>
          </label>
          <label className="form-control">
            <span className="label-text">{t('Price') || 'Price'}</span>
            <input className="input input-bordered" type="number" min="0" value={f.priceAmount} onChange={(e)=>setF(s=>({...s, priceAmount:e.target.value}))} />
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

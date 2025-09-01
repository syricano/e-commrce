import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import usePageTitle from '@/hooks/usePageTitle';
import axiosInstance from '@/config/axiosConfig';
import StoreNav from '@/components/merchant/StoreNav.jsx';
import { errorHandler } from '@/utils';
import { useLang } from '@/context/LangProvider';

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const money = (v) => Math.max(0, Math.round(toNum(v)));

export default function StoreOffers() {
  const { id } = useParams();
  usePageTitle('Store Offers');
  const storeId = id;
  const { t } = useLang();

  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [f, setF] = useState({
    storeProductId: '',
    compareAtAmount: '',
    discountPct: 10,
    priceAmount: '',
    currency: 'EUR',
    stockOnHand: 0,
  });
  const [priceTouched, setPriceTouched] = useState(false);
  const DISCOUNTS = Array.from({ length: 15 }, (_, i) => (i + 1) * 5);
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
    } catch (e) {
      errorHandler(e, t('Failed to load') || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (storeId) load();
  }, [storeId]);

  // Index last offer per product
  const lastByProduct = useMemo(() => {
    const by = new Map();
    for (const o of offers || []) {
      const pid = o?.product?.id ?? o?.storeProductId;
      if (!pid) continue;
      const cur = by.get(pid);
      if (!cur || o.id > cur.id) by.set(pid, o);
    }
    return by;
  }, [offers]);

  // Fallbacks from product
  const baseFromProduct = (pid) => {
    const p = products.find((x) => Number(x.id) === Number(pid));
    if (!p) return 0;
    const cand = toNum(p?.attributes?.base_price ?? p?.attributes?.price ?? 0);
    return cand > 0 ? cand : 0;
  };
  const stockFromProduct = (pid) => {
    const p = products.find((x) => Number(x.id) === Number(pid));
    return Number.isFinite(Number(p?.stockOnHand)) ? toNum(p?.stockOnHand) : 0;
  };

  const calcPrice = (base, pct) => {
    const b = toNum(base);
    const d = Number(pct) || 0;
    if (b <= 0) return '';
    return String(money(b * (1 - d / 100)));
  };

  // Autofill original price and stock whenever product changes or data refreshes
  useEffect(() => {
    const pid = Number(f.storeProductId);
    if (!pid) return;

    const last = lastByProduct.get(pid) || null;
    const base =
      toNum(last?.compareAtAmount) ||
      toNum(last?.priceAmount) ||
      baseFromProduct(pid) ||
      0;

    const stock = Number.isFinite(Number(last?.stockOnHand))
      ? toNum(last?.stockOnHand)
      : stockFromProduct(pid);

    const next = {
      ...f,
      compareAtAmount: base > 0 ? String(base) : '',
      stockOnHand: stock,
    };

    if (!priceTouched) next.priceAmount = calcPrice(base, f.discountPct);

    // Avoid noise updates
    const changed =
      next.compareAtAmount !== f.compareAtAmount ||
      next.stockOnHand !== f.stockOnHand ||
      (!priceTouched && next.priceAmount !== f.priceAmount);

    if (changed) setF(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.storeProductId, offers, products]);

  // If discount changes and user did not touch price, recompute final price
  useEffect(() => {
    if (priceTouched) return;
    const base = toNum(f.compareAtAmount);
    const recomputed = calcPrice(base, f.discountPct);
    if (recomputed !== f.priceAmount) {
      setF((s) => ({ ...s, priceAmount: recomputed }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.discountPct, f.compareAtAmount, priceTouched]);

  const onCreate = async () => {
    const base = toNum(f.compareAtAmount);
    const price = toNum(f.priceAmount);
    const pid = Number(f.storeProductId);
    if (!pid || base <= 0 || price < 0) return;

    const payload = {
      storeProductId: pid,
      compareAtAmount: money(base),
      priceAmount: money(price),
      currency: f.currency || 'EUR',
      stockOnHand: toNum(f.stockOnHand),
    };

    try {
      await axiosInstance.post('/store-offers', payload);
      setF({
        storeProductId: '',
        compareAtAmount: '',
        discountPct: 10,
        priceAmount: '',
        currency: 'EUR',
        stockOnHand: 0,
      });
      setPriceTouched(false);
      await load();
    } catch (e) {
      errorHandler(e, t('Create failed') || 'Create failed');
    }
  };

  const valid =
    f.storeProductId &&
    toNum(f.compareAtAmount) > 0 &&
    String(f.priceAmount) !== '';

  return (
    <section className="p-4 space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">
        {t('Store')} {storeId} — {t('Offers') || 'Offers'}
      </h1>
      <StoreNav />

      <div className="card bg-base-100 border">
        <div className="card-body grid md:grid-cols-6 gap-3">
          {/* Discount */}
          <label className="form-control">
            <span className="label-text">{t('Discount') || 'Discount'}</span>
            <select
              className="select select-bordered"
              value={f.discountPct}
              onChange={(e) =>
                setF((s) => ({ ...s, discountPct: Number(e.target.value) }))
              }
            >
              {DISCOUNTS.map((d) => (
                <option key={d} value={d}>
                  {d}%
                </option>
              ))}
            </select>
          </label>

          {/* Product */}
          <label className="form-control md:col-span-2">
            <span className="label-text">{t('Product') || 'Product'}</span>
            <select
              className="select select-bordered"
              value={f.storeProductId}
              onChange={(e) => {
                setPriceTouched(false);
                setF((s) => ({ ...s, storeProductId: e.target.value }));
              }}
            >
              <option value="">
                {t('Select product') || '— select product —'}
              </option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (SKU {p.articleNumber})
                </option>
              ))}
            </select>
          </label>

          {/* Original Price */}
          <label className="form-control">
            <span className="label-text">
              {t('Original Price') || 'Original Price'}
            </span>
            <input
              className="input input-bordered"
              type="number"
              min="0"
              value={f.compareAtAmount}
              onChange={(e) =>
                setF((s) => ({ ...s, compareAtAmount: e.target.value }))
              }
            />
          </label>

          {/* Final Price */}
          <label className="form-control">
            <span className="label-text">{t('Final Price') || 'Final Price'}</span>
            <input
              className="input input-bordered"
              type="number"
              min="0"
              value={f.priceAmount}
              onChange={(e) => {
                setPriceTouched(true);
                setF((s) => ({ ...s, priceAmount: e.target.value }));
              }}
            />
          </label>

          {/* Currency */}
          <label className="form-control">
            <span className="label-text">{t('Currency') || 'Currency'}</span>
            <select
              className="select select-bordered"
              value={f.currency}
              onChange={(e) => setF((s) => ({ ...s, currency: e.target.value }))}
            >
              {['EUR', 'USD', 'GBP', 'AED', 'SAR'].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          {/* Stock */}
          <label className="form-control">
            <span className="label-text">{t('Stock') || 'Stock'}</span>
            <input
              className="input input-bordered"
              type="number"
              min="0"
              value={f.stockOnHand}
              onChange={(e) =>
                setF((s) => ({ ...s, stockOnHand: e.target.value }))
              }
            />
          </label>

          <div className="md:col-span-6 text-right">
            <button
              type="button"
              className="btn btn-primary"
              disabled={!valid}
              onClick={onCreate}
            >
              {t('Add Offer') || 'Add Offer'}
            </button>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 border">
        <div className="card-body">
          {loading && (
            <div className="opacity-60">{t('Loading…') || 'Loading…'}</div>
          )}
          {!loading && offers.length === 0 && (
            <div className="opacity-60">{t('No offers') || 'No offers'}</div>
          )}
          {!loading && offers.length > 0 && (
            <ul className="divide-y">
              {offers.map((o) => (
                <li key={o.id} className="py-2 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{o.product?.name}</div>
                    <div className="text-xs opacity-70">
                      SKU: {o.product?.articleNumber}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="opacity-70 text-sm">
                      {o.priceAmount} {o.currency} • {t('Stock') || 'Stock'}{' '}
                      {o.stockOnHand}
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={async () => {
                        if (confirm(t('Delete offer?') || 'Delete offer?')) {
                          try {
                            await axiosInstance.delete(`/store-offers/${o.id}`);
                            await load();
                          } catch (e) {
                            errorHandler(e, t('Delete failed') || 'Delete failed');
                          }
                        }
                      }}
                    >
                      {t('Delete') || 'Delete'}
                    </button>
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

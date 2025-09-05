import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '@/config/axiosConfig';
import { useLang } from '@/context/LangProvider';
import usePageTitle from '@/hooks/usePageTitle';
import { errorHandler } from '@/utils';
import { asyncHandler } from '@/utils/asyncHandler';
import { addCartItem } from '@/services/api';
import { toast } from 'react-hot-toast';
import { normalizeImg } from '@/utils/media';

const clamp = (n, lo = 1, hi = 99) =>
  Math.min(hi, Math.max(lo, Number.isFinite(Number(n)) ? Number(n) : lo));
const toMajor = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0); // already major

function DealsPage() {
  const { t, lang } = useLang();
  usePageTitle('offers');

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [addingId, setAddingId] = useState(null);

  // per-item quantity (default 1)
  const [qty, setQty] = useState({});
  const getQty = (id) => (qty[id] ?? 1);
  const setQtyFor = (id, val, maxCap = 99) =>
    setQty((q) => ({ ...q, [id]: clamp(Number(val) || 1, 1, maxCap) }));

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      setErr('');
      try {
        const [soRes, b2cRes] = await Promise.all([
          axiosInstance.get('/store-offers/public', { params: { limit: 24 } }),
          axiosInstance.get('/offers/public', { params: { limit: 24, locale: lang || 'ar' } }),
        ]);

        const storeOffers = (soRes?.data?.items || []).map((o) => {
          const p = o.product || {};
          const title = p.name || `#${p.id}`;
          const img = normalizeImg(p?.media?.[0]?.url || '');
          return {
            _type: 'store-offer',
            _ts: o.updatedAt || o.createdAt || 0,
            id: `so-${o.id}`,
            storeOfferId: o.id,
            title,
            sku: p.articleNumber ? `${t('SKU') || 'SKU'} ${p.articleNumber}` : '',
            price: toMajor(o.priceAmount),
            compareAt: toMajor(o.compareAtAmount),
            currency: o.currency || 'EUR',
            stock: Number(o.stockOnHand) || 0,
            image: img,
            href: `/offers/store/${o.id}`,
            store: o?.product?.store
              ? { id: o.product.store.id, name: o.product.store.name, slug: o.product.store.slug }
              : null,
          };
        });

        const b2cOffers = (b2cRes?.data?.items || []).map((o) => {
          const prod = o?.variant?.product || {};
          const tr = Array.isArray(prod.translations) ? prod.translations[0] : null;
          const title = tr?.name || prod.name || `#${o.id}`;
          const img = normalizeImg(prod?.media?.[0]?.url || '');
          return {
            _type: 'b2c-offer',
            _ts: o.updatedAt || o.createdAt || 0,
            id: `of-${o.id}`,
            offerId: o.id,
            title,
            sku: o?.variant?.sku ? `${t('SKU') || 'SKU'} ${o.variant.sku}` : '',
            price: toMajor(o.priceAmount),
            compareAt: toMajor(o.compareAtAmount),
            currency: o.currency || 'EUR',
            stock: undefined,
            image: img,
            href: `/offers/${o.id}`,
          };
        });

        const merged = [...storeOffers, ...b2cOffers].sort(
          (a, b) => new Date(b._ts).getTime() - new Date(a._ts).getTime()
        );

        if (alive) setItems(merged);
      } catch (_e) {
        if (alive) setErr(t('Failed to load') || 'Failed to load');
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const addToCart = asyncHandler(
    async (it) => {
      const maxCap = Number.isFinite(it.stock) ? clamp(it.stock, 1, 99) : 99;
      const quantity = clamp(getQty(it.id), 1, maxCap);
      setAddingId(it.id);

      if (it._type === 'b2c-offer' && it.offerId) {
        await addCartItem({ offerId: it.offerId, quantity });
      } else if (it._type === 'store-offer' && it.storeOfferId) {
        await addCartItem({ storeOfferId: it.storeOfferId, quantity });
      }

      window.dispatchEvent(new CustomEvent('cart:updated'));
      try {
        const title = it?.title || `#${it.id}`;
        toast.success((t('Added to cart') || 'Added to cart') + (title ? `: ${title}` : ''));
      } catch {}
    },
    t('Failed to add to cart') || 'Failed to add to cart'
  );

  return (
    <section className="p-4 max-w-screen-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">{t('offers') || 'Deals'}</h1>

      {err && <div className="alert alert-error text-sm">{err}</div>}
      {loading && items.length === 0 && (
        <div className="opacity-60">{t('Loading…') || 'Loading…'}</div>
      )}
      {!loading && items.length === 0 && !err && (
        <div className="opacity-60">{t('No offers') || 'No offers'}</div>
      )}

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
        {items.map((it) => {
          const discounted = (it.compareAt || 0) > (it.price || 0) && it.price > 0;
          const priceText = `${it.price.toFixed(2)} ${it.currency}`;
          const compareText = `${(it.compareAt || 0).toFixed(2)} ${it.currency}`;
          const maxCap = Number.isFinite(it.stock) ? clamp(it.stock, 1, 99) : 99;
          const outOfStock = Number.isFinite(it.stock) && it.stock <= 0;

          return (
            <div
              key={it.id}
              className="group bg-[var(--b1)] text-[var(--bc)] shadow-xl rounded-xl overflow-hidden transition-transform duration-300 hover:scale-105 border border-base-200"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                {it.image ? (
                  <img
                    src={it.image}
                    alt={it.title}
                    className="w-full h-full object-cover rounded-t-xl transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex justify-center items-center bg-[var(--b1)]">
                    <span className="loading loading-spinner text-[var(--bc)] w-8 h-8" />
                  </div>
                )}
                {outOfStock && (
                  <div className="absolute top-2 right-2 badge badge-neutral">
                    {t('Out of stock') || 'Out of stock'}
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="font-semibold truncate" title={it.title}>
                  {it.title}
                </div>
                {it.sku && <div className="text-xs opacity-70 truncate">{it.sku}</div>}

                <div className="mt-2 flex items-baseline gap-2">
                  <div className="text-lg font-bold">{priceText}</div>
                  {discounted && <div className="text-sm line-through opacity-60">{compareText}</div>}
                </div>

                {it.stock != null && (
                  <div className="text-xs opacity-70">
                    {t('Stock') || 'Stock'}: {it.stock}
                  </div>
                )}

                <div className="mt-3 flex flex-col gap-2">
                  {/* Quantity stepper */}
                  <div className="join w-full">
                    <button
                      type="button"
                      className="btn btn-sm join-item"
                      onClick={() => setQtyFor(it.id, getQty(it.id) - 1, maxCap)}
                      aria-label={t('Decrease quantity') || 'Decrease quantity'}
                      disabled={outOfStock}
                    >
                      −
                    </button>
                    <input
                      className="input input-sm input-bordered join-item w-14 text-center"
                      value={getQty(it.id)}
                      onChange={(e) => setQtyFor(it.id, e.target.value, maxCap)}
                      inputMode="numeric"
                      disabled={outOfStock}
                    />
                    <button
                      type="button"
                      className="btn btn-sm join-item"
                      onClick={() => setQtyFor(it.id, getQty(it.id) + 1, maxCap)}
                      aria-label={t('Increase quantity') || 'Increase quantity'}
                      disabled={outOfStock}
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart for BOTH offer types */}
                  <button
                    className="btn btn-primary btn-sm w-full"
                    onClick={() =>
                      addToCart(it)
                        .catch((e) => errorHandler(e, e?.__label || t('Failed to add to cart') || 'Failed to add to cart'))
                        .finally(() => setAddingId(null))
                    }
                    disabled={addingId === it.id || outOfStock}
                    aria-busy={addingId === it.id}
                  >
                    {addingId === it.id ? (t('Adding…') || 'Adding…') : t('Add to Cart') || 'Add to Cart'}
                  </button>

                  {/* Optional Store link */}
                  {it._type === 'store-offer' && it.store?.id ? (
                    <Link to={`/stores/${it.store.id}`} className="btn btn-outline btn-sm" title={it.store.name}>
                      {t('Store') || 'Store'}
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default DealsPage;

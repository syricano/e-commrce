import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '@/config/axiosConfig';
import usePageTitle from '@/hooks/usePageTitle';
import { useLang } from '@/context/LangProvider';
import { errorHandler } from '@/utils';
import { asyncHandler } from '@/utils/asyncHandler';
import { addCartItem } from '@/services/api';
import { toast } from 'react-hot-toast';
import { normalizeImg } from '@/utils/media';

const clamp = (n, lo = 1, hi = 99) => Math.min(hi, Math.max(lo, Number(n) || 0));
const toMajor = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0); // already major

export default function StoreOfferDetail() {
  const { id } = useParams();
  const { t } = useLang();
  usePageTitle('offers');

  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr('');
      try {
        const res = await axiosInstance.get(`/store-offers/public/${id}`);
        const row = res?.data?.item || res?.data || null;
        if (alive) setOffer(row);
      } catch (_e) {
        if (alive) setErr(t('Failed to load') || 'Failed to load');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, t]);

  const addToCart = asyncHandler(
    async () => {
      if (!offer?.id) return;
      const maxCap = Number.isFinite(Number(offer.stockOnHand)) ? clamp(offer.stockOnHand, 1, 99) : 99;
      const quantity = clamp(qty, 1, maxCap);
      setAdding(true);
      await addCartItem({ storeOfferId: offer.id, quantity });
      window.dispatchEvent(new CustomEvent('cart:updated'));
      try {
        const p = offer?.product || {};
        const title = p?.name || `#${p?.id || offer.id}`;
        toast.success((t('Added to cart') || 'Added to cart') + (title ? `: ${title}` : ''));
      } catch {}
    },
    t('Failed to add to cart') || 'Failed to add to cart'
  );

  if (loading) {
    return <section className="p-4">{t('Loading…') || 'Loading…'}</section>;
  }
  if (err) {
    return <section className="p-4 text-error">{err}</section>;
  }
  if (!offer) {
    return <section className="p-4">{t('Not found') || 'Not found'}</section>;
  }

  const p = offer.product || {};
  const img = normalizeImg(p?.media?.[0]?.url || '');
  const title = p.name || `#${p.id}`;
  const currency = offer.currency || 'EUR';

  // Amounts are MAJOR units
  const price = toMajor(offer.priceAmount);
  const compareAt = toMajor(offer.compareAtAmount);
  const priceText = `${price.toFixed(2)} ${currency}`;
  const compareText =
    compareAt > price ? `${compareAt.toFixed(2)} ${currency}` : '';

  const outOfStock = Number.isFinite(Number(offer.stockOnHand)) && Number(offer.stockOnHand) <= 0;

  return (
    <section className="p-4 max-w-5xl mx-auto space-y-4">
      <nav className="text-sm opacity-70">
        <Link to="/deals" className="underline">
          {t('Deals') || 'Deals'}
        </Link>
        <span> / </span>
        <span>{title}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded-lg overflow-hidden">
          {img ? (
            <img src={img} alt={title} className="w-full h-auto object-cover" />
          ) : (
            <div className="aspect-[4/3] bg-base-200" />
          )}
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold">{title}</h1>

          {p.articleNumber ? (
            <div className="opacity-70 text-sm">
              {t('SKU') || 'SKU'} {p.articleNumber}
            </div>
          ) : null}

          <div className="flex items-baseline gap-3">
            <div className="text-2xl font-semibold">{priceText}</div>
            {compareText ? <div className="line-through opacity-60">{compareText}</div> : null}
          </div>

          <div className="opacity-70 text-sm">
            {t('Stock') || 'Stock'}:{' '}
            {Number.isFinite(Number(offer.stockOnHand)) ? offer.stockOnHand : t('Unknown') || 'Unknown'}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setQty((q) => clamp(q - 1))}
              disabled={outOfStock}
              aria-label={t('Decrease quantity') || 'Decrease quantity'}
            >
              −
            </button>
            <input
              className="input input-sm input-bordered w-16 text-center"
              value={qty}
              onChange={(e) => setQty(clamp(e.target.value))}
              inputMode="numeric"
              disabled={outOfStock}
              aria-label={t('Quantity') || 'Quantity'}
            />
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setQty((q) => clamp(q + 1))}
              disabled={outOfStock}
              aria-label={t('Increase quantity') || 'Increase quantity'}
            >
              +
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                addToCart()
                  .catch((e) => errorHandler(e, e?.__label || t('Failed to add to cart') || 'Failed to add to cart'))
                  .finally(() => setAdding(false))
              }
              disabled={adding || outOfStock}
              aria-busy={adding}
            >
              {adding ? (t('Adding…') || 'Adding…') : t('Add to Cart') || 'Add to Cart'}
            </button>

            {p.store?.id ? (
              <Link to={`/stores/${p.store.id}`} className="btn btn-outline">
                {t('Store') || 'Store'}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

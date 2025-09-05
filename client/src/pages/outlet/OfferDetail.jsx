import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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

export default function OfferDetail() {
  const { id } = useParams();
  const { t, lang } = useLang();
  usePageTitle('offers');

  const [data, setData] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      setErr('');
      try {
        const res = await axiosInstance.get(`/offers/public/${id}`, {
          params: { locale: lang || 'ar' },
        });
        if (!alive) return;
        setData(res?.data || res);
      } catch (_e) {
        if (!alive) return;
        setErr(t('Failed to load') || 'Failed to load');
      } finally {
        if (alive) setLoading(false);
      }
    };
    if (id) load();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, lang]);

  const addToCart = asyncHandler(
    async () => {
      if (!data?.id) return;
      setAdding(true);
      await addCartItem({ offerId: Number(data.id), quantity: clamp(qty, 1, 99) });
      window.dispatchEvent(new CustomEvent('cart:updated'));
      try {
        const prod = data?.variant?.product || {};
        const tr = Array.isArray(prod.translations) ? prod.translations[0] : null;
        const title = tr?.name || prod.name || `#${data.id}`;
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
  if (!data) {
    return <section className="p-4">{t('Not found') || 'Not found'}</section>;
  }

  const prod = data?.variant?.product || {};
  const tr = Array.isArray(prod.translations) ? prod.translations[0] : null;
  const title = tr?.name || prod.name || `#${data.id}`;
  const img = normalizeImg(prod?.media?.[0]?.url || '');
  const sku = data?.variant?.sku ? `${t('SKU') || 'SKU'} ${data.variant.sku}` : '';

  // Amounts are MAJOR units
  const price = toMajor(data?.priceAmount);
  const compareAt = toMajor(data?.compareAtAmount);
  const currency = data?.currency || 'EUR';
  const discounted = compareAt > price && price > 0;

  return (
    <section className="p-4 max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded overflow-hidden">
          {img ? (
            <img src={img} alt={title} className="w-full h-auto object-cover" />
          ) : (
            <div className="aspect-[4/3] bg-base-200" />
          )}
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold">{title}</h1>
          {sku && <div className="opacity-70 text-sm">{sku}</div>}

          <div className="flex items-baseline gap-3">
            <div className="text-xl font-bold">
              {price.toFixed(2)} {currency}
            </div>
            {discounted && (
              <div className="line-through opacity-60">
                {compareAt.toFixed(2)} {currency}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setQty((q) => clamp(q - 1))}
              aria-label={t('Decrease quantity') || 'Decrease quantity'}
            >
              −
            </button>
            <input
              className="input input-sm input-bordered w-16 text-center"
              value={qty}
              onChange={(e) => setQty(clamp(e.target.value))}
              inputMode="numeric"
              aria-label={t('Quantity') || 'Quantity'}
            />
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setQty((q) => clamp(q + 1))}
              aria-label={t('Increase quantity') || 'Increase quantity'}
            >
              +
            </button>
          </div>

          <div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                addToCart()
                  .catch((e) => errorHandler(e, e?.__label || t('Failed to add to cart') || 'Failed to add to cart'))
                  .finally(() => setAdding(false))
              }
              disabled={adding}
              aria-busy={adding}
            >
              {adding ? (t('Adding…') || 'Adding…') : t('Add to Cart') || 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

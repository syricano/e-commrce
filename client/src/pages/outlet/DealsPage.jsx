import { useEffect, useState } from 'react';
import axiosInstance from '@/config/axiosConfig';
import { useLang } from '@/context/LangProvider';
import usePageTitle from '@/hooks/usePageTitle';

const toNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const resolve = (url) =>
  url && !/^https?:\/\//.test(url)
    ? `${import.meta.env.VITE_FILES_BASE_URL || ''}${url.startsWith('/') ? '' : '/'}${url}`
    : url;

function DealsPage() {
  const { t, lang } = useLang();
  usePageTitle('offers');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

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
          const img = resolve(p?.media?.[0]?.url || '');
          return {
            _type: 'store-offer',
            _ts: o.updatedAt || o.createdAt || 0,
            id: `so-${o.id}`,
            title,
            sku: p.articleNumber ? `SKU ${p.articleNumber}` : '',
            price: toNum(o.priceAmount),
            compareAt: toNum(o.compareAtAmount),
            currency: o.currency || 'EUR',
            stock: o.stockOnHand,
            image: img,
          };
        });

        const b2cOffers = (b2cRes?.data?.items || []).map((o) => {
          const prod = o?.variant?.product || {};
          const tr = Array.isArray(prod.translations) ? prod.translations[0] : null;
          const title = tr?.name || prod.name || `#${o.id}`;
          const img = resolve(prod?.media?.[0]?.url || '');
          return {
            _type: 'b2c-offer',
            _ts: o.updatedAt || o.createdAt || 0,
            id: `of-${o.id}`,
            title,
            sku: o?.variant?.sku ? `SKU ${o.variant.sku}` : '',
            price: toNum(o.priceAmount),
            compareAt: toNum(o.compareAtAmount),
            currency: o.currency || 'EUR',
            stock: undefined,
            image: img,
          };
        });

        const merged = [...storeOffers, ...b2cOffers].sort(
          (a, b) => new Date(b._ts).getTime() - new Date(a._ts).getTime()
        );

        if (alive) setItems(merged);
      } catch {
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

  return (
    <section className="p-4 max-w-screen-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">{t('offers') || 'Deals'}</h1>

      {err && <div className="alert alert-error text-sm">{err}</div>}
      {loading && items.length === 0 && <div className="opacity-60">{t('Loading…') || 'Loading…'}</div>}
      {!loading && items.length === 0 && !err && <div className="opacity-60">{t('No offers') || 'No offers'}</div>}

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
        {items.map((it) => {
          const discounted = it.compareAt > it.price && it.price > 0;
          return (
            <div key={it.id} className="card bg-base-100 border hover:shadow">
              {it.image ? (
                <figure className="aspect-[4/3] overflow-hidden">
                  <img src={it.image} alt={it.title} className="w-full h-full object-cover" />
                </figure>
              ) : (
                <div className="aspect-[4/3] bg-base-200" />
              )}
              <div className="card-body p-3">
                <div className="font-semibold truncate">{it.title}</div>
                {it.sku && <div className="text-xs opacity-70 truncate">{it.sku}</div>}
                <div className="mt-2 flex items-baseline gap-2">
                  <div className="text-lg font-bold">
                    {it.price} {it.currency}
                  </div>
                  {discounted && (
                    <div className="text-sm line-through opacity-60">
                      {it.compareAt} {it.currency}
                    </div>
                  )}
                </div>
                {it.stock != null && (
                  <div className="text-xs opacity-70">
                    {t('Stock') || 'Stock'}: {it.stock}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default DealsPage;

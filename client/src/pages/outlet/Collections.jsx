// client/src/pages/outlet/Collections.jsx
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '@/config/axiosConfig';
import usePageTitle from '@/hooks/usePageTitle';
import { useLang } from '@/context/LangProvider';
import Spinner from '@/components/UI/Spinner.jsx';
import { normalizeImg } from '@/utils/media.js';
import { formatMoneyMajor } from '@/utils/money';

export default function Collections() {
  const { t, lang } = useLang();

  // keys configured on backend
  const KEY_FEATURED = 'featured';       // manual
  const KEY_NEW = 'new-arrivals';        // rule

  // page title is generic, not the collection name
  usePageTitle(lang === 'ar' ? 'المجموعات' : 'Collections');

  const [featuredColl, setFeaturedColl] = useState(null);
  const [featured, setFeatured] = useState([]);
  const [offerColl, setOfferColl] = useState(null);
  const [offers, setOffers] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Defensive: if backend still returns minor (legacy), correct it heuristically
  const toMoney = (amount, cur) => {
    if (amount == null) return '';
    const n = Number(amount);
    if (!Number.isFinite(n)) return '';
    // If looks like cents (<1) but scaled by 100 becomes >= 1, assume legacy minor
    const maybeMinor = n > 0 && n < 1 && Math.round(n * 100) >= 1;
    const val = maybeMinor ? Math.round(n * 100) : n;
    return formatMoneyMajor(cur, val);
  };

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      try {
        const [fRes, oRes, lRes] = await Promise.all([
          axiosInstance.get(`/collections/${KEY_FEATURED}/items`, { params: { limit: 12, locale: lang || 'ar' } }).catch(() => ({ data: { items: [], collection: null } })),
          axiosInstance.get(`/collections/${KEY_NEW}/items`, { params: { limit: 12, locale: lang || 'ar' } }).catch(() => ({ data: { items: [], collection: null } })),
          axiosInstance.get('/listings', { params: { limit: 12 } }).catch(() => ({ data: { items: [] } })),
        ]);

        if (!alive) return;
        setFeaturedColl(fRes?.data?.collection || null);
        setFeatured(fRes?.data?.items || []);
        setOfferColl(oRes?.data?.collection || null);
        setOffers(oRes?.data?.items || []);
        setListings(lRes?.data?.items || lRes?.data || []);
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => { alive = false; };
  }, [lang]);

  const featuredCards = useMemo(() => (
    (featured || []).map((it) => ({
      id: it.id,
      title: it.title || `#${it.id}`,
      img: normalizeImg(it.imageUrl),
      href: it.href || (it.type === 'storeOffer' ? `/offers/${it.id}` : `/p/${it.id}`),
      price: it.priceAmount,
      currency: it.currency || 'EUR',
    }))
  ), [featured]);

  const offerCards = useMemo(() => (
    (offers || []).map((o) => ({
      id: o.id,
      title: o.title || `#${o.id}`,
      img: normalizeImg(o.imageUrl),
      href: o.href || `/offers/${o.id}`,
      price: o.priceAmount,
      currency: o.currency || 'EUR',
    }))
  ), [offers]);

  const listingCards = useMemo(() => (
    (listings || []).map((l) => {
      const title =
        l?.title ||
        (Array.isArray(l?.translations) &&
          (l.translations.find((tr) => tr.locale === lang)?.title ||
           l.translations.find((tr) => tr.locale === 'ar')?.title ||
           l.translations.find((tr) => tr.locale === 'en')?.title)) ||
        `#${l.id}`;
      const img = normalizeImg(l?.media?.[0]?.url || '');
      return { id: l.id, title, img, href: `/listings/${l.id}`, price: l?.priceAmount, currency: l?.currency || 'EUR' };
    })
  ), [listings, lang]);

  const secTitle = (coll, ar, en) => coll?.translation?.title || (lang === 'ar' ? ar : en);
  const secSub   = (coll, ar, en) => coll?.translation?.subtitle || (lang === 'ar' ? ar : en);

  return (
    <section className="p-4 max-w-screen-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{lang === 'ar' ? 'المجموعات' : 'Collections'}</h1>
      </div>

      {loading && (
        <div className="flex items-center gap-2 mb-4">
          <Spinner size={24} />
          <span className="opacity-70">{lang === 'ar' ? 'جارِ التحميل…' : 'Loading…'}</span>
        </div>
      )}

      {/* Featured (manual) */}
      {featuredCards.length > 0 && (
        <div className="mb-8">
          <div className="mb-3">
            <h2 className="text-xl font-semibold">
              {secTitle(featuredColl, 'مختارات المحرر', 'Editor’s Picks')}
            </h2>
            <div className="opacity-70 text-sm">
              {secSub(featuredColl, 'عناصر مختارة يدويًا', 'Hand-picked items')}
            </div>
          </div>
          <div className={`${lang === 'ar' ? 'flex justify-end' : 'flex justify-start'}`}>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 w-full">
              {featuredCards.map((card) => (
                <Link key={card.id} to={card.href} className="card bg-base-100 border hover:shadow">
                  {card.img && (
                    <figure className="aspect-square overflow-hidden">
                      <img src={card.img} alt={card.title} className="object-cover w-full h-full" />
                    </figure>
                  )}
                  <div className="card-body p-3">
                    <div className="font-semibold line-clamp-1">{card.title}</div>
                    <div className="opacity-70 text-sm">{toMoney(card.price, card.currency)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New from Stores (rule) */}
      <div className="mb-8">
        <div className="mb-3">
          <h2 className="text-xl font-semibold">
            {secTitle(offerColl, 'وصل حديثًا من المتاجر', 'New from Stores')}
          </h2>
          <div className="opacity-70 text-sm">
            {secSub(offerColl, 'أحدث العروض من المتاجر', 'Latest store offers')}
          </div>
        </div>
        <div className={`${lang === 'ar' ? 'flex justify-end' : 'flex justify-start'}`}>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 w-full">
            {offerCards.map((card) => (
              <Link key={card.id} to={card.href} className="card bg-base-100 border hover:shadow">
                {card.img && (
                  <figure className="aspect-square overflow-hidden">
                    <img src={card.img} alt={card.title} className="object-cover w-full h-full" />
                  </figure>
                )}
                <div className="card-body p-3">
                  <div className="font-semibold line-clamp-1">{card.title}</div>
                  <div className="opacity-70 text-sm">{toMoney(card.price, card.currency)}</div>
                </div>
              </Link>
            ))}
            {!loading && offerCards.length === 0 && (
              <div className="opacity-60">
                {lang === 'ar' ? 'لا عناصر في هذه المجموعة' : 'No items in this collection'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New community listings */}
      <div>
        <h2 className="text-xl font-semibold mb-3">
          {lang === 'ar' ? 'إعلانات جديدة' : 'New Listings'}
        </h2>
        <div className={`${lang === 'ar' ? 'flex justify-end' : 'flex justify-start'}`}>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 w-full">
            {listingCards.map((card) => (
              <Link key={card.id} to={card.href} className="card bg-base-100 border hover:shadow">
                {card.img && (
                  <figure className="aspect-square overflow-hidden">
                    <img src={card.img} alt={card.title} className="object-cover w-full h-full" />
                  </figure>
                )}
                <div className="card-body p-3">
                  <div className="font-semibold line-clamp-1">{card.title}</div>
                  <div className="opacity-70 text-sm">
                    {card.price != null ? `${card.price} ${card.currency}` : ''}
                  </div>
                </div>
              </Link>
            ))}
            {!loading && listingCards.length === 0 && (
              <div className="opacity-60">
                {lang === 'ar' ? 'لا إعلانات جديدة' : 'No new listings'}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

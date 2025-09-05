import ImageSlider from '@/components/UI/ImageSlider';
import Spinner from '@/components/UI/Spinner.jsx';
import usePageTitle from '@/hooks/usePageTitle';
import { useLang } from '@/context/LangProvider';
import { useEffect, useMemo, useState } from 'react';
import axiosInstance from '@/config/axiosConfig';
import { Link } from 'react-router-dom';

const HomePage = () => {
  usePageTitle('home');
  const { t, lang } = useLang();
  const [cats, setCats] = useState([]);
  const [catTrs, setCatTrs] = useState([]);
  const [listings, setListings] = useState([]);
  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [listingsLoaded, setListingsLoaded] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [featuredLoaded, setFeaturedLoaded] = useState(false);
  const [newArrivalsLoaded, setNewArrivalsLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, tRes, lRes, pRes] = await Promise.all([
          axiosInstance.get('/categories', { params: { limit: 1000 } }),
          axiosInstance.get('/category-translations', { params: { limit: 1000 } }).catch(() => ({ data: [] })),
          axiosInstance.get('/listings', { params: { limit: 8 } }),
          axiosInstance.get('/products', { params: { limit: 8, isActive: true, moderationStatus: 'approved' } }),
        ]);
        setCats(cRes?.data?.items || cRes?.data || []);
        setCatTrs(tRes?.data?.items || tRes?.data || []);
        const ls = lRes?.data?.items || lRes?.data || [];
        const ps = pRes?.data?.items || pRes?.data || [];
        setListings(Array.isArray(ls) ? ls : []);
        setProducts(Array.isArray(ps) ? ps : []);
        setListingsLoaded(true);
        setProductsLoaded(true);
      } catch {}
    };
    load();
  }, []);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setFeaturedLoaded(false);
      setNewArrivalsLoaded(false);
      try {
        const [fRes, nRes] = await Promise.all([
          axiosInstance.get('/collections/featured/items', { params: { limit: 8, locale: lang } }).catch(() => ({ data: { items: [] } })),
          axiosInstance.get('/collections/new-arrivals/items', { params: { limit: 8, locale: lang } }).catch(() => ({ data: { items: [] } })),
        ]);
        if (!alive) return;
        setFeatured(fRes?.data?.items || []);
        setNewArrivals(nRes?.data?.items || []);
      } finally {
        if (alive) { setFeaturedLoaded(true); setNewArrivalsLoaded(true); }
      }
    };
    load();
    return () => { alive = false; };
  }, [lang]);

  const catNameById = useMemo(() => {
    const byId = new Map();
    for (const t of catTrs) {
      if (t?.categoryId && t?.locale === lang && t?.name) byId.set(Number(t.categoryId), t.name);
    }
    for (const t of catTrs) {
      const id = Number(t?.categoryId);
      if (id && !byId.has(id) && t?.name) byId.set(id, t.name);
    }
    return byId;
  }, [catTrs, lang]);

  const catSlugById = useMemo(() => {
    const by = new Map();
    for (const t of catTrs) {
      const id = Number(t?.categoryId);
      if (!id) continue;
      if (!by.has(id) || t?.locale === lang) by.set(id, t?.slug || '');
    }
    return by;
  }, [catTrs, lang]);

  const byParent = useMemo(() => {
    const map = new Map();
    for (const c of cats) {
      const p = c.parentId || null;
      if (!map.has(p)) map.set(p, []);
      map.get(p).push(c);
    }
    for (const list of map.values()) list.sort((a, b) => (a.position || 0) - (b.position || 0) || (a.id - b.id));
    return map;
  }, [cats]);

  const roots = useMemo(() => byParent.get(null) || byParent.get(undefined) || byParent.get(0) || [], [byParent]);
  const [activeParentId, setActiveParentId] = useState(null);
  useEffect(() => {
    if (!activeParentId && roots.length) setActiveParentId(roots[0].id);
  }, [roots, activeParentId]);

  // Scroll reveal for sections/cards
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    els.forEach(el => {
      el.classList.add('opacity-0', 'translate-y-2');
    });
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('opacity-100', 'translate-y-0');
          e.target.classList.remove('opacity-0', 'translate-y-2');
          e.target.classList.add('transition-all', 'duration-500');
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.15 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const sideBar = lang === 'ar' ? 'before:right-0' : 'before:left-0';

  return (
    <div className="space-y-12" dir={dir}>
      <section className="main-section flex flex-col items-center justify-center gap-6 py-8 px-4">
        <ImageSlider />
      </section>

      {/* ===== Categories: elegant vertical list with expandable sub-list ===== */}
      <section className="max-w-screen-2xl mx-auto px-4" data-reveal>
        <h2 className="text-xl font-semibold mb-4">{t('Categories')}</h2>

        {!cats?.length && (
          <div className="flex items-center gap-2 py-2">
            <Spinner size={20} />
            <span className="opacity-70 text-sm">{t('Loading') || 'Loading'}</span>
          </div>
        )}

        {!!cats?.length && (
          <ul className="list-none m-0 p-0">
            {roots.map((r, idx) => {
              const isActive = activeParentId === r.id;
              const name = catNameById.get(Number(r.id)) || r.slug || `#${r.id}`;
              const children = byParent.get(r.id) || [];

              return (
                <li key={r.id} className="relative">
                  {/* Parent row */}
                  <button
                    onClick={() => setActiveParentId(r.id)}
                    onMouseEnter={() => setActiveParentId(r.id)}
                    aria-expanded={isActive ? 'true' : 'false'}
                    className={`group w-full text-start py-2.5 px-3 rounded-lg
                      hover:bg-base-200/70 focus:outline-none focus-visible:ring focus-visible:ring-primary/40
                      transition-all duration-200 ${isActive ? 'bg-base-200' : ''} relative
                      before:content-[""] before:absolute before:top-0 before:bottom-0 ${sideBar}
                      before:w-1 before:rounded-full before:transition-all
                      ${isActive ? 'before:bg-primary' : 'before:bg-transparent group-hover:before:bg-base-300'}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-block font-medium group-hover:translate-x-0.5 transition-transform">{name}</span>
                      <span className={`ms-auto text-sm opacity-70 transition-transform ${isActive ? 'rotate-90' : ''}`}>
                        ▶
                      </span>
                    </div>
                  </button>

                  {/* Sub-list: expands directly under the active parent */}
                  <div className={`overflow-hidden transition-all duration-300 ${isActive ? 'max-h-[800px] mt-1' : 'max-h-0'}`}>
                    <ul className={`list-none ${lang === 'ar' ? 'ps-0 pe-4' : 'ps-4 pe-0'} space-y-1`}>
                      {children.length === 0 && isActive && (
                        <li className="opacity-60 py-1">{t('No subcategories')}</li>
                      )}
                      {children.map((c) => {
                        const subName = catNameById.get(Number(c.id)) || c.slug || `#${c.id}`;
                        const slug = catSlugById.get(Number(c.id)) || c.id;
                        return (
                          <li key={c.id}>
                            <Link
                              to={`/c/${slug}`}
                              className="inline-flex items-center gap-2 text-sm rounded-md px-3 py-1.5
                                         hover:bg-base-200/70 hover:-translate-y-0.5 transition-all duration-150
                                         focus:outline-none focus-visible:ring focus-visible:ring-primary/40"
                              title={subName}
                            >
                              <span className={`${lang === 'ar' ? 'rotate-180' : ''}`}>›</span>
                              <span className="truncate">{subName}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* subtle divider between parents */}
                  {idx !== roots.length - 1 && <div className="h-px bg-base-200 my-2" />}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ===== Listings ===== */}
      <section className="max-w-screen-2xl mx-auto px-4" data-reveal>
        <h2 className="text-xl font-semibold mb-4">{t('Listings')}</h2>
        {!listingsLoaded && <Spinner size={24} />}
        <div className={`${lang === 'ar' ? 'flex justify-end' : 'flex justify-start'}`}>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 w-full">
            {listings.map(l => {
              const media = Array.isArray(l?.media) ? l.media : [];
              const img = media[0]?.url || '';
              const trs = Array.isArray(l?.translations) ? l.translations : [];
              const by = {}; for (const t of trs) if (t?.locale) by[t.locale] = t;
              const title = by[lang]?.title || by.en?.title || by.ar?.title || trs[0]?.title || `#${l.id}`;
              const src = img && !/^https?:\/\//.test(img)
                ? `${import.meta.env.VITE_FILES_BASE_URL || ''}${img.startsWith('/') ? '' : '/'}${img}`
                : img;
              return (
                <Link
                  key={l.id}
                  to={`/listings/${l.id}`}
                  className="card bg-base-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  {src ? (
                    <img src={src} alt={title} className="w-full h-28 object-cover" />
                  ) : (
                    <div className="w-full h-28 bg-base-200 flex items-center justify-center text-sm opacity-70">{t('No image')}</div>
                  )}
                  <div className="card-body p-3">
                    <div className="font-semibold truncate" title={title}>{title}</div>
                    <div className="opacity-70 text-sm">{l.priceAmount} {l.currency}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Products ===== */}
      <section className="max-w-screen-2xl mx-auto px-4" data-reveal>
        <h2 className="text-xl font-semibold mb-4">{t('Products')}</h2>
        {!productsLoaded && <Spinner size={24} />}
        <div className={`${lang === 'ar' ? 'flex justify-end' : 'flex justify-start'}`}>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 w-full">
            {productsLoaded && products.length === 0 && (
              <div className="opacity-60 col-span-full">{t('No products') || 'No products'}</div>
            )}
            {products.map(p => (
              <Link
                key={p.id}
                to={`/products/${p.id}`}
                className="card bg-base-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="card-body p-3">
                  <div className="font-semibold">{t('SKU') || 'SKU'} {p.canonicalSku || p.id}</div>
                  <div className="opacity-70 text-sm">{String(p.moderationStatus || 'draft')}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== New Arrivals ===== */}
      <section className="max-w-screen-2xl mx-auto px-4" data-reveal>
        <h2 className="text-xl font-semibold mb-4">{t('New Arrivals') || 'New Arrivals'}</h2>
        {!newArrivalsLoaded && <Spinner size={24} />}
        <div className={`${lang === 'ar' ? 'flex justify-end' : 'flex justify-start'}`}>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 w-full">
            {newArrivalsLoaded && newArrivals.length === 0 && (
              <div className="opacity-60 col-span-full">{t('noItems')}</div>
            )}
            {newArrivals.map(it => (
              <a
                key={`na-${it.type}-${it.id}`}
                href={it.href}
                className="card bg-base-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                {it.imageUrl ? (
                  <img src={it.imageUrl} alt={it.title} className="w-full h-28 object-cover" />
                ) : (
                  <div className="w-full h-28 bg-base-200 flex items-center justify-center text-sm opacity-70">{t('No image')}</div>
                )}
                <div className="card-body p-3">
                  <div className="font-semibold truncate" title={it.title}>{it.title}</div>
                  {it.priceAmount != null && (
                    <div className="opacity-70 text-sm">{it.priceAmount} {it.currency}</div>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Featured ===== */}
      <section className="max-w-screen-2xl mx-auto px-4" data-reveal>
        <h2 className="text-xl font-semibold mb-4">{t('Featured') || 'Featured'}</h2>
        {!featuredLoaded && <Spinner size={24} />}
        <div className={`${lang === 'ar' ? 'flex justify-end' : 'flex justify-start'}`}>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 w-full">
            {featuredLoaded && featured.length === 0 && (
              <div className="opacity-60 col-span-full">{t('noItems')}</div>
            )}
            {featured.map(it => (
              <a
                key={`ft-${it.type}-${it.id}`}
                href={it.href}
                className="card bg-base-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                {it.imageUrl ? (
                  <img src={it.imageUrl} alt={it.title} className="w-full h-28 object-cover" />
                ) : (
                  <div className="w-full h-28 bg-base-200 flex items-center justify-center text-sm opacity-70">{t('No image')}</div>
                )}
                <div className="card-body p-3">
                  <div className="font-semibold truncate" title={it.title}>{it.title}</div>
                  {it.priceAmount != null && (
                    <div className="opacity-70 text-sm">{it.priceAmount} {it.currency}</div>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

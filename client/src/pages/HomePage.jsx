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
  const [listingsLoaded, setListingsLoaded] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, tRes, lRes, pRes] = await Promise.all([
          axiosInstance.get('/categories', { params: { limit: 12 } }),
          axiosInstance.get('/category-translations', { params: { limit: 1000 } }).catch(()=>({data:[]})),
          axiosInstance.get('/listings', { params: { limit: 8 } }),
          axiosInstance.get('/products', { params: { limit: 8 } }),
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
    for (const list of map.values()) list.sort((a,b)=> (a.position||0)-(b.position||0) || (a.id-b.id));
    return map;
  }, [cats]);

  const roots = useMemo(() => byParent.get(null) || byParent.get(undefined) || byParent.get(0) || [], [byParent]);
  const [activeParentId, setActiveParentId] = useState(null);
  useEffect(() => {
    if (!activeParentId && roots.length) setActiveParentId(roots[0].id);
  }, [roots, activeParentId]);

  return (
    <div className="space-y-10">
      <section className="main-section flex flex-col items-center justify-center gap-6 py-8 px-4">
        <ImageSlider />
      </section>

      <section className={`max-w-screen-2xl mx-auto px-4  ${lang === 'ar' ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
        <h2 className="text-xl font-semibold mb-3">{t('Categories')}</h2>
        {!cats?.length && <Spinner size={24} />}
        {!!cats?.length && (
          <div className="flex gap-4 flex-col">
            <ul className="w-full md:w-48 bg-base-200 rounded-box divide-y">
              {roots.map((r) => (
                <li key={r.id}>
                  <button
                    className={`w-full text-start px-3 py-2 ${activeParentId===r.id?'bg-base-300 font-semibold':''}`}
                    onMouseEnter={()=>setActiveParentId(r.id)}
                    onClick={()=>setActiveParentId(r.id)}
                  >
                    {catNameById.get(Number(r.id)) || r.slug || `#${r.id}`}
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex-1">
              <div className={`${lang==='ar'?'flex justify-end':'flex justify-start'}`}>
                <div dir={lang==='ar' ? 'rtl' : undefined} className={`grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 ${lang==='ar'?'text-right justify-items-end w-fit':'text-left w-full'}`}>
                  {(byParent.get(activeParentId) || []).map((c) => (
                    <Link key={c.id} to={`/c/${catSlugById.get(Number(c.id)) || c.id}`} className="card bg-base-100 border hover:shadow transition">
                      <div className="card-body p-3">
                        <div className="font-semibold truncate">{catNameById.get(Number(c.id)) || c.slug || `#${c.id}`}</div>
                      </div>
                    </Link>
                  ))}
                  {(byParent.get(activeParentId)?.length===0) && (
                    <div className="opacity-60">No subcategories</div>
                  )}
                </div>
            </div>
            </div>
          </div>
        )}
      </section>

      <section className="max-w-screen-2xl mx-auto px-4">
        <h2 className="text-xl font-semibold mb-3">{t('Listings')}</h2>
        {!listingsLoaded && <Spinner size={24} />}
        <div className={`${lang==='ar'?'flex justify-end':'flex justify-start'}`}>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 w-full">
            {listings.map(l => {
              const media = Array.isArray(l?.media) ? l.media : [];
              const img = media[0]?.url || '';
              const trs = Array.isArray(l?.translations) ? l.translations : [];
              const by = {}; for (const t of trs) if (t?.locale) by[t.locale] = t;
              const title = by[lang]?.title || by.en?.title || by.ar?.title || trs[0]?.title || `#${l.id}`;
              const src = img && !/^https?:\/\//.test(img)
                ? `${import.meta.env.VITE_FILES_BASE_URL || ''}${img.startsWith('/')? '' : '/'}${img}`
                : img;
              return (
                <Link key={l.id} to={`/listings/${l.id}`} className="card bg-base-100 border hover:shadow">
                  {src ? (
                    <img src={src} alt={title} className="w-full h-28 object-cover" />
                  ) : (
                    <div className="w-full h-28 bg-base-200 flex items-center justify-center text-sm opacity-70">No image</div>
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

      <section className="max-w-screen-2xl mx-auto px-4">
        <h2 className="text-xl font-semibold mb-3">{t('Products')}</h2>
        {!productsLoaded && <Spinner size={24} />}
        <div className={`${lang==='ar'?'flex justify-end':'flex justify-start'}`}>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 w-full">
            {productsLoaded && products.length === 0 && (
              <div className="opacity-60 col-span-full">No products found</div>
            )}
            {products.map(p => (
              <Link key={p.id} to={`/products/${p.id}`} className="card bg-base-100 border hover:shadow">
                <div className="card-body p-3">
                  <div className="font-semibold">SKU {p.canonicalSku || p.id}</div>
                  <div className="opacity-70 text-sm">{String(p.moderationStatus || 'draft')}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

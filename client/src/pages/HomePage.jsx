import ImageSlider from '@/components/UI/ImageSlider';
import usePageTitle from '@/hooks/usePageTitle';
import { useLang } from '@/context/LangProvider';
import { useEffect, useMemo, useState } from 'react';
import axiosInstance from '@/config/axiosConfig';

const HomePage = () => {
  usePageTitle('home');
  const { t, lang } = useLang();
  const [cats, setCats] = useState([]);
  const [catTrs, setCatTrs] = useState([]);
  const [listings, setListings] = useState([]);
  const [products, setProducts] = useState([]);

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
        setListings(lRes?.data?.items || lRes?.data || []);
        setProducts(pRes?.data?.items || pRes?.data || []);
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

  return (
    <div className="space-y-10">
      <section className="main-section flex flex-col items-center justify-center gap-6 py-8 px-4">
        <ImageSlider />
      </section>

      <section className="max-w-screen-2xl mx-auto px-4">
        <h2 className="text-xl font-semibold mb-3">{t('Categories')}</h2>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {cats.map(c => (
            <a key={c.id} href={`/c/${c.slug || c.id}`} className="card bg-base-200 hover:shadow transition">
              <div className="card-body p-3">
                <div className="font-semibold truncate">{catNameById.get(Number(c.id)) || c.slug || `#${c.id}`}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="max-w-screen-2xl mx-auto px-4">
        <h2 className="text-xl font-semibold mb-3">{t('Listings')}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {listings.map(l => (
            <a key={l.id} href={`/listings/${l.id}`} className="card bg-base-100 border hover:shadow">
              <div className="card-body p-3">
                <div className="font-semibold">#{l.id}</div>
                <div className="opacity-70 text-sm">{l.priceAmount} {l.currency}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="max-w-screen-2xl mx-auto px-4">
        <h2 className="text-xl font-semibold mb-3">{t('Products')}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {products.map(p => (
            <a key={p.id} href={`/products/${p.id}`} className="card bg-base-100 border hover:shadow">
              <div className="card-body p-3">
                <div className="font-semibold">SKU {p.canonicalSku || p.id}</div>
                <div className="opacity-70 text-sm">{String(p.moderationStatus || 'draft')}</div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;

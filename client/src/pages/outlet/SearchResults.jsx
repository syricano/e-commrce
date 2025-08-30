import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import usePageTitle from '@/hooks/usePageTitle';
import { useLang } from '@/context/LangProvider';
import { searchAll } from '@/services';
import Spinner from '@/components/UI/Spinner.jsx';

export default function SearchResults() {
  const { t, lang } = useLang();
  usePageTitle('search');
  const [sp, setSp] = useSearchParams();
  const q = (sp.get('q') || '').trim();
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [products, setProducts] = useState([]);
  const [storeProducts, setStoreProducts] = useState([]);

  useEffect(() => {
    let live = true;
    const run = async () => {
      if (!q) { setListings([]); setProducts([]); return; }
      setLoading(true);
      try {
        const res = await searchAll({ q });
        const data = res?.data || res || {};
        if (!live) return;
        setListings(Array.isArray(data.listings) ? data.listings : []);
        setProducts(Array.isArray(data.products) ? data.products : []);
        setStoreProducts(Array.isArray(data.storeProducts) ? data.storeProducts : []);
      } finally { if (live) setLoading(false); }
    };
    run();
    return () => { live = false; };
  }, [q]);

  const listingCards = useMemo(() => {
    return (listings || []).map((tr) => {
      const l = tr?.listing || {};
      const id = l?.id;
      const title = tr?.title || `#${id || ''}`;
      return (
        <Link key={`l-${id}-${tr?.id || ''}`} to={`/listings/${id}`} className="card bg-base-100 border hover:shadow">
          <div className="card-body p-3">
            <div className="font-semibold truncate">{title}</div>
            <div className="opacity-70 text-sm">{l?.priceAmount} {l?.currency}</div>
          </div>
        </Link>
      );
    });
  }, [listings]);

  const productCards = useMemo(() => {
    return (products || []).map((tr) => {
      const p = tr?.product || {};
      const id = p?.id;
      const name = tr?.name || `#${id || ''}`;
      return (
        <Link key={`p-${id}-${tr?.id || ''}`} to={`/products/${id}`} className="card bg-base-100 border hover:shadow">
          <div className="card-body p-3">
            <div className="font-semibold truncate">{name}</div>
            <div className="opacity-70 text-sm">{String(p?.moderationStatus || 'draft')}</div>
          </div>
        </Link>
      );
    });
  }, [products]);

  const storeProductCards = useMemo(() => {
    return (storeProducts || []).map((sp) => (
      <Link key={`sp-${sp.id}`} to={`/stores/${sp.storeId}`} className="card bg-base-100 border hover:shadow">
        <div className="card-body p-3">
          <div className="font-semibold truncate">{sp.name}</div>
          <div className="opacity-70 text-sm">SKU: {sp.articleNumber}</div>
        </div>
      </Link>
    ));
  }, [storeProducts]);

  const onSubmit = (e) => {
    e.preventDefault();
    const input = new FormData(e.currentTarget).get('q');
    const next = new URLSearchParams(sp);
    if (input) next.set('q', String(input)); else next.delete('q');
    setSp(next, { replace: false });
  };

  return (
    <section className="p-4 max-w-screen-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">{t('search') || 'Search'}</h1>

      <form onSubmit={onSubmit} className="max-w-2xl">
        <label className="input input-bordered flex items-center gap-2">
          <input name="q" defaultValue={q} className="grow" type="search" placeholder={t('search') || 'Search…'} />
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeWidth="2" d="m21 21-4.3-4.3M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/>
          </svg>
        </label>
      </form>

      {loading && <Spinner size={28} />}

      {!loading && !q && (
        <div className="opacity-60">{lang==='ar' ? 'أدخل نصًا للبحث' : 'Enter a query to search'}</div>
      )}

      {!loading && q && (
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">{lang==='ar' ? 'الإعلانات' : 'Listings'}</h2>
            <div className={`${lang==='ar'?'flex justify-end':'flex justify-start'}`}>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 w-full">
                {listingCards}
                {listingCards.length === 0 && (
                  <div className="opacity-60">{lang==='ar'?'لا نتائج':'No results'}</div>
                )}
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">{t('Products') || (lang==='ar' ? 'المنتجات' : 'Products')}</h2>
            <div className={`${lang==='ar'?'flex justify-end':'flex justify-start'}`}>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 w-full">
                {productCards}
                {productCards.length === 0 && (
                  <div className="opacity-60">{lang==='ar'?'لا نتائج':'No results'}</div>
                )}
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">{t('Store Items') || (lang==='ar' ? 'عناصر المتاجر' : 'Store Items')}</h2>
            <div className={`${lang==='ar'?'flex justify-end':'flex justify-start'}`}>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 w-full">
                {storeProductCards}
                {storeProductCards.length === 0 && (
                  <div className="opacity-60">{t('No results') || (lang==='ar'?'لا نتائج':'No results')}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

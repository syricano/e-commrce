import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '@/config/axiosConfig';
import usePageTitle from '@/hooks/usePageTitle';
import { useLang } from '@/context/LangProvider';
import Spinner from '@/components/UI/Spinner.jsx';

export default function Collections() {
  const { t, lang } = useLang();
  usePageTitle('offers');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/offers', { params: { limit: 24 } });
        const rows = res?.data?.items || res?.data || [];
        setItems(Array.isArray(rows) ? rows : []);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <section className="p-4 max-w-screen-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t('offers') || 'Offers'}</h1>
      {loading && <Spinner size={28} />}
      <div className={`${lang==='ar'?'flex justify-end':'flex justify-start'}`}>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 w-full">
          {items.map((o) => (
            <div key={o.id} className="card bg-base-100 border hover:shadow">
              <div className="card-body p-3">
                <div className="font-semibold">#{o.id}</div>
                <div className="opacity-70 text-sm">{o.priceAmount} {o.currency}</div>
                <div className="text-xs opacity-60">Variant: {o.variantId} • Store: {o.storeId}</div>
              </div>
            </div>
          ))}
          {!loading && items.length === 0 && (
            <div className="opacity-60">{lang==='ar'?'لا عروض':'No offers'}</div>
          )}
        </div>
      </div>
    </section>
  );
}


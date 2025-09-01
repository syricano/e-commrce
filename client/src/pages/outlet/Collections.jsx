import { useEffect, useState } from 'react';
import axiosInstance from '@/config/axiosConfig';
import usePageTitle from '@/hooks/usePageTitle';
import { useLang } from '@/context/LangProvider';
import Spinner from '@/components/UI/Spinner.jsx';

export default function Collections() {
  const { t, lang } = useLang();
  usePageTitle('new arrivals');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      try {
        // Fetch curated collections list (admin-managed). Public read.
        const res = await axiosInstance.get('/collections', { params: { limit: 24 } });
        const rows = res?.data?.items || res?.data || [];
        if (!alive) return;
        setItems(Array.isArray(rows) ? rows : []);
      } finally { setLoading(false); }
    };
    load();
    return () => { alive = false; };
  }, []);

  return (
    <section className="p-4 max-w-screen-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t('new arrivals') || 'New Arrivals'}</h1>
      {loading && <Spinner size={28} />}
      <div className={`${lang==='ar'?'flex justify-end':'flex justify-start'}`}>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 w-full">
          {items.map((c) => (
            <div key={c.id} className="card bg-base-100 border hover:shadow">
              <div className="card-body p-3">
                <div className="font-semibold">#{c.id}</div>
                {/* Show a few generic fields if present */}
                {c.name && <div className="opacity-80">{c.name}</div>}
                {c.slug && <div className="text-xs opacity-60">/{c.slug}</div>}
              </div>
            </div>
          ))}
          {!loading && items.length === 0 && (
            <div className="opacity-60">{lang==='ar'?'لا عناصر':'No items'}</div>
          )}
        </div>
      </div>
    </section>
  );
}

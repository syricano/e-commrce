import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/config/axiosConfig';
import usePageTitle from '@/hooks/usePageTitle';
import { useLang } from '@/context/LangProvider';
import Spinner from '@/components/UI/Spinner.jsx';

export default function StoreDetail() {
  const { id } = useParams();
  const { t } = useLang();
  usePageTitle('Store');
  const [store, setStore] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      setLoading(true);
      try {
        const [sRes, oRes] = await Promise.all([
          axiosInstance.get(`/stores/${id}`),
          axiosInstance.get('/store-offers', { params: { storeId: id } }).catch(()=>({ data: [] })),
        ]);
        if (!alive) return;
        setStore(sRes?.data || null);
        const rows = oRes?.data?.items || oRes?.data || [];
        setOffers(Array.isArray(rows) ? rows : []);
      } catch {
        if (alive) { setStore(null); setOffers([]); }
      } finally { if (alive) setLoading(false); }
    };
    if (id) run();
    return () => { alive = false; };
  }, [id]);

  return (
    <section className="p-4 max-w-screen-2xl mx-auto">
      {loading && <Spinner size={32} />}
      {!loading && !store && <div className="opacity-60">{t('Not found') || 'Not found'}</div>}
      {!loading && store && (
        <>
          <h1 className="text-2xl font-bold mb-2">{store.name || `#${store.id}`}</h1>
          <div className="opacity-70 mb-4 text-sm">
            {(store.country || store.city) && (
              <span>{[store.country, store.city].filter(Boolean).join(' • ')} • </span>
            )}
            <span>{store.email || ''}</span>{store.phone ? ` • ${store.phone}` : ''}
          </div>
          <h2 className="text-xl font-semibold mb-2">{t('Offers') || 'Offers'}</h2>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
            {offers.map(o => (
              <div key={o.id} className="card bg-base-100 border">
                <div className="card-body p-3">
                  <div className="font-semibold truncate">{o.product?.name || `#${o.id}`}</div>
                  <div className="opacity-70 text-sm">
                    {o.compareAtAmount ? (
                      <>
                        <span className="line-through opacity-60 mr-1">{o.compareAtAmount} {o.currency}</span>
                        <span>{o.priceAmount} {o.currency}</span>
                      </>
                    ) : (
                      <span>{o.priceAmount} {o.currency}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {!offers.length && <div className="opacity-60">{t('No offers') || 'No offers'}</div>}
          </div>
        </>
      )}
    </section>
  );
}

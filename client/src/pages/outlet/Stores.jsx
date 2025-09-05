import { useEffect, useState } from 'react';
import axiosInstance from '@/config/axiosConfig';
import usePageTitle from '@/hooks/usePageTitle';
import { useLang } from '@/context/LangProvider';
import { errorHandler } from '@/utils';
import Spinner from '@/components/UI/Spinner.jsx';
import { Link } from 'react-router-dom';

export default function Stores() {
  usePageTitle('Stores');
  const { t } = useLang();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/stores', { params: { limit: 200 } });
        const rows = res?.data?.items || res?.data || [];
        setItems(Array.isArray(rows) ? rows : []);
      } catch (e) { errorHandler(e, 'Failed to load stores'); }
      finally { setLoading(false); }
    };
    run();
  }, []);

  return (
    <section className="p-4 max-w-screen-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t('Stores') || 'Stores'}</h1>
      {loading && <Spinner size={32} />}
      {!loading && items.length === 0 && (
        <div className="opacity-60">{t('No stores') || 'No stores'}</div>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((s) => (
          <Link key={s.id} to={`/stores/${s.id}`} className="card bg-base-100 border hover:shadow">
            <div className="card-body p-4">
              <div className="font-semibold">{s.name || s.slug || `#${s.id}`}</div>
              <div className="opacity-70 text-sm">{s.email || s.phone || ''}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

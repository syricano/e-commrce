import { useEffect, useState } from 'react';
import usePageTitle from '@/hooks/usePageTitle';
import { useLang } from '@/context/LangProvider';
import { useAuth } from '@/context';
import axiosInstance from '@/config/axiosConfig';
import { Link } from 'react-router-dom';

export default function MerchantDashboard() {
  const { t } = useLang();
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  usePageTitle('Dashboard');

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/stores', { params: { ownerUserId: user?.id, limit: 100 } });
        const rows = res?.data?.items || res?.data || [];
        if (alive) setStores(Array.isArray(rows) ? rows : []);
      } catch {}
      finally { if (alive) setLoading(false); }
    };
    if (user?.id) load();
    return () => { alive = false; };
  }, [user?.id]);

  return (
    <section className="p-4 space-y-4 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('dashboard')} — {t('Stores')}</h1>
        <Link to="/admin/stores" className="btn btn-outline btn-sm">{t('ManageStores') || 'Admin: Manage Stores'}</Link>
      </div>

      {loading && <div className="opacity-60">Loading…</div>}
      {!loading && stores.length === 0 && (
        <div className="card bg-base-200">
          <div className="card-body">
            <div className="font-semibold">No stores yet</div>
            <div className="opacity-70 text-sm">Once your account is approved as a seller, an admin can create your store. After it goes live, it will appear here.</div>
          </div>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {stores.map(s => (
          <div key={s.id} className="card bg-base-100 border">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{s.name}</div>
                  <div className="opacity-70 text-sm">{s.slug} • {s.email || '—'} • {s.phone || '—'}</div>
                </div>
                <div className={`badge ${s.status==='active'?'badge-success':'badge-ghost'}`}>{s.status}</div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button className="btn btn-sm" disabled title="Coming soon">Manage Categories</button>
                <button className="btn btn-sm" disabled title="Coming soon">Manage Products</button>
                <button className="btn btn-sm" disabled title="Coming soon">Manage Offers</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

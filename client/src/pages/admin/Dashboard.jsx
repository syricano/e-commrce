import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats } from '@/services';
import { errorHandler } from '@/utils';
import { useLang } from '@/context/LangProvider';
import usePageTitle from '@/hooks/usePageTitle';

const cards = [
  { to: "/admin/users",               labelKey: "Users" },
  { to: "/admin/stores",              labelKey: "Stores" },
  { to: "/admin/products",            labelKey: "ManageProducts" },
  { to: "/admin/categories",          labelKey: "ManageCategories" },
  { to: "/admin/collections",         labelKey: "ManageCollections" },
  { to: "/admin/media",               labelKey: "ManageMedia" },
  { to: "/admin/listings",            labelKey: "ManageListings" },
  { to: "/admin/listing-offers",      labelKey: "ManageListingOffers" },
  { to: "/admin/listing-promotions",  labelKey: "ManageListingPromotions" },
  { to: "/admin/reports",             labelKey: "ManageReports" },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const { t } = useLang();
  usePageTitle('dashboard');

  useEffect(() => {
    getAdminStats()
      .then((res) => setStats(res?.data || res))
      .catch((e) => errorHandler(e, 'Failed to load dashboard'));
  }, []);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">{t('dashboard')}</h1>

      {/* KPI */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats ? Object.entries(stats).map(([k,v])=>(
          <div key={k} className="card bg-base-200">
            <div className="card-body">
              <h3 className="card-title capitalize">{t(k) || k}</h3>
              <p className="text-3xl font-bold">{v}</p>
            </div>
          </div>
        )) : <div className="opacity-60">Loading…</div>}
      </div>

      {/* Manage tiles */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(c=>(
          <Link key={c.to} to={c.to} className="card bg-base-100 border hover:shadow-md transition">
            <div className="card-body">
              <h3 className="card-title">{t(c.labelKey)}</h3>
              <p className="opacity-70">{t('Manage')} {t(c.labelKey)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats } from '@/services';
import { errorHandler } from '@/utils';

const cards = [
  { to: "/admin/manage/users",               label: "Users" },
  { to: "/admin/manage/stores",              label: "ManageStores" },
  { to: "/admin/manage/products",            label: "ManageProducts" },
  { to: "/admin/manage/categories",          label: "ManageCategories" },
  { to: "/admin/manage/collections",         label: "ManageCollections" },
  { to: "/admin/manage/media",               label: "ManageMedia" },
  { to: "/admin/manage/listings",            label: "ManageListings" },
  { to: "/admin/manage/listing-offers",      label: "ManageListingOffers" },
  { to: "/admin/manage/listing-promotions",  label: "ManageListingPromotions" },
  { to: "/admin/manage/reports",             label: "ManageReports" },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getAdminStats()
      .then((res) => setStats(res?.data || res))
      .catch((e) => errorHandler(e, 'Failed to load dashboard'));
  }, []);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {/* KPI */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats ? Object.entries(stats).map(([k,v])=>(
          <div key={k} className="card bg-base-200">
            <div className="card-body">
              <h3 className="card-title capitalize">{k}</h3>
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
              <h3 className="card-title">{c.label}</h3>
              <p className="opacity-70">Open {c.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

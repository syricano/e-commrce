import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats } from '@/services';
import { errorHandler } from '@/utils';
import { useLang } from '@/context/LangProvider';
import usePageTitle from '@/hooks/usePageTitle';

const metricOrder = [
  { key: 'Users',            icon: '👤' },
  { key: 'Stores',           icon: '🏬' },
  { key: 'Products',         icon: '📦' },
  { key: 'Listings',         icon: '📋' },
  { key: 'Offers',           icon: '🏷️' },
  { key: 'Reports',          icon: '🛎️' },
  { key: 'Collections',      icon: '🗂️' },
  { key: 'CollectionItems',  icon: '✅' },
];

const manageCards = [
  { to: '/admin/users',                 labelKey: 'Users' },
  { to: '/admin/stores',                labelKey: 'Stores' },
  { to: '/admin/products',              labelKey: 'ManageProducts' },
  { to: '/admin/categories',            labelKey: 'ManageCategories' },
  { to: '/admin/collections',           labelKey: 'ManageCollections' },
  { to: '/admin/collection-items',      labelKey: 'ManageCollectionItems' }, // added
  { to: '/admin/media',                 labelKey: 'ManageMedia' },
  { to: '/admin/listings',              labelKey: 'ManageListings' },
  { to: '/admin/listing-offers',        labelKey: 'ManageListingOffers' },
  { to: '/admin/listing-promotions',    labelKey: 'ManageListingPromotions' },
  { to: '/admin/reports',               labelKey: 'ManageReports' },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const { t, lang } = useLang();
  usePageTitle('dashboard');

  useEffect(() => {
    getAdminStats()
      .then((res) => setStats(res?.data || res))
      .catch((e) => errorHandler(e, 'Failed to load dashboard'));
  }, []);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('dashboard')}</h1>
      </div>

      {/* KPI grid: fully responsive */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {(stats ? metricOrder : Array.from({ length: 6 })).map((m, idx) => {
          if (!stats) {
            return (
              <div key={`skeleton-${idx}`} className="card bg-base-200 animate-pulse">
                <div className="card-body">
                  <div className="h-6 w-12 bg-base-300 rounded mb-2" />
                  <div className="h-4 w-24 bg-base-300 rounded" />
                </div>
              </div>
            );
          }
          const value = Number(stats[m.key] ?? 0);
          return (
            <div key={m.key} className="card bg-base-100 border">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="text-3xl">{m.icon}</div>
                  <div className="text-3xl font-bold">{value.toLocaleString(lang || 'en')}</div>
                </div>
                <div className="opacity-70 mt-1">{t(m.key) || m.key}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Manage tiles: responsive cards */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {manageCards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="card bg-base-100 border hover:shadow-md focus:outline-none focus:ring transition"
          >
            <div className="card-body">
              <h3 className="card-title">{t(c.labelKey) || c.labelKey}</h3>
              <p className="opacity-70">{t('Manage')} {t(c.labelKey) || c.labelKey}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

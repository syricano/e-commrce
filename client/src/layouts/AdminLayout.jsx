import { Outlet, Link, useLocation } from "react-router-dom";
import { useLang } from "@/context/LangProvider";

const items = [
  { to: "/admin/users", labelKey: "Users" },
  { to: "/admin/stores", labelKey: "Stores" },
  { to: "/admin/products", labelKey: "ManageProducts" },
  { to: "/admin/categories", labelKey: "ManageCategories" },
  { to: "/admin/collections", labelKey: "ManageCollections" },
  { to: "/admin/media", labelKey: "ManageMedia" },
  { to: "/admin/listings", labelKey: "ManageListings" },
  { to: "/admin/listing-offers", labelKey: "ManageListingOffers" },
  { to: "/admin/listing-promotions", labelKey: "ManageListingPromotions" },
  { to: "/admin/reports", labelKey: "ManageReports" },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const { t } = useLang();
  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-4 grid grid-cols-12 gap-4">
      <aside className="col-span-12 lg:col-span-3">
        <div className="card bg-base-200">
          <div className="card-body p-3">
            <ul className="menu menu-sm">
              <li className="menu-title">{t('admin')}</li>
              <li><Link to="/admin" className={pathname==="/admin" ? "active" : ""}>{t('dashboard')}</Link></li>
              <li className="menu-title">{t('Manage')}</li>
              {items.map(i=>(
                <li key={i.to}>
                  <Link to={i.to} className={pathname.startsWith(i.to)? "active": ""}>{t(i.labelKey)}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
      <main className="col-span-12 lg:col-span-9">
        <Outlet />
      </main>
    </div>
  );
}

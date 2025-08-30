import { Outlet, Link, useLocation } from "react-router-dom";
import { useState } from 'react';
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
  { to: "/admin/partner-requests", labelKey: "Partner Requests" },
  { to: "/admin/invoices", labelKey: "Invoices" },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-4 flex gap-4">
      <aside
        className={`transition-all duration-200 ${open ? 'w-64' : 'w-14'} bg-base-200 rounded-box h-fit`}
        onMouseEnter={()=>setOpen(true)}
        onMouseLeave={()=>setOpen(false)}
      >
        <div className="p-2">
          <ul className="menu menu-sm">
            <li className="menu-title">{open ? t('admin') : '⚙️'}</li>
            <li><Link to="/admin" className={pathname==="/admin" ? "active" : ""}>{open ? t('dashboard') : '🏠'}</Link></li>
            <li className="menu-title">{open ? t('Manage') : '📋'}</li>
            {items.map(i=> (
              <li key={i.to}>
                <Link to={i.to} className={pathname.startsWith(i.to)? "active": ""}>{open ? t(i.labelKey) : '•'}</Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

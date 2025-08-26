import { Outlet, Link, useLocation } from "react-router-dom";

const items = [
  { to: "/admin/users", label: "Users" },
  { to: "/admin/stores", label: "ManageStores" },
  { to: "/admin/products", label: "ManageProducts" },
  { to: "/admin/categories", label: "ManageCategories" },
  { to: "/admin/collections", label: "ManageCollections" },
  { to: "/admin/media", label: "ManageMedia" },
  { to: "/admin/listings", label: "ManageListings" },
  { to: "/admin/listing-offers", label: "ManageListingOffers" },
  { to: "/admin/listing-promotions", label: "ManageListingPromotions" },
  { to: "/admin/reports", label: "ManageReports" },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-4 grid grid-cols-12 gap-4">
      <aside className="col-span-12 lg:col-span-3">
        <div className="card bg-base-200">
          <div className="card-body p-3">
            <ul className="menu menu-sm">
              <li className="menu-title">Admin</li>
              <li><Link to="/admin" className={pathname==="/admin" ? "active" : ""}>Dashboard</Link></li>
              <li className="menu-title">Manage</li>
              {items.map(i=>(
                <li key={i.to}>
                  <Link to={i.to} className={pathname.startsWith(i.to)? "active": ""}>{i.label}</Link>
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

// client/src/layouts/AccountLayout.jsx
import { Outlet, NavLink } from "react-router-dom";

const items = [
  { to: ".",                label: "Overview", exact: true }, // /account
  { to: "./orders",         label: "My Orders" },             // /account/orders
  { to: "./listings",       label: "My Listings" },           // /account/listings
  { to: "./listings/new",   label: "Create a Listing" },      // /account/listings/new
];

export default function AccountLayout() {
  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-4 grid grid-cols-12 gap-4">
      <aside className="col-span-12 lg:col-span-3">
        <div className="card bg-base-200">
          <div className="card-body p-3">
            <ul className="menu menu-sm">
              <li className="menu-title">Account</li>
              {items.map(i => (
                <li key={i.to}>
                  <NavLink to={i.to} end={i.exact} className={({isActive}) => isActive ? "active" : ""}>
                    {i.label}
                  </NavLink>
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

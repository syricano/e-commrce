// client/src/layouts/AccountLayout.jsx
import { Outlet, NavLink } from "react-router-dom";
import { useLang } from "@/context/LangProvider";

const items = [
  { to: ".",                labelKey: "Overview", exact: true },
  { to: "./orders",         labelKey: "My Orders" },
  { to: "./listings",       labelKey: "My Listings" },
  { to: "./listings/new",   labelKey: "Create a Listing" },
];

export default function AccountLayout() {
  const { t } = useLang();
  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-4 grid grid-cols-12 gap-4">
      <aside className="col-span-12 lg:col-span-3">
        <div className="card bg-base-200">
          <div className="card-body p-3">
            <ul className="menu menu-sm">
              <li className="menu-title">{t('Account') || 'Account'}</li>
              {items.map(i => (
                <li key={i.to}>
                  <NavLink to={i.to} end={i.exact} className={({isActive}) => isActive ? "active" : ""}>
                    {t(i.labelKey) || i.labelKey}
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

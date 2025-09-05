import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/context/LangProvider";
import useIsMobile from "@/hooks/useIsMobile";

const NAV_ITEMS = [
  { to: "/admin",                   labelKey: "dashboard" },
  { to: "/admin/users",             labelKey: "Users" },
  { to: "/admin/stores",            labelKey: "Stores" },
  { to: "/merchant",                labelKey: "Store Management" },
  { to: "/admin/products",          labelKey: "ManageProducts" },
  { to: "/admin/categories",        labelKey: "ManageCategories" },
  { to: "/admin/collections",       labelKey: "ManageCollections" },
  { to: "/admin/collection-items",  labelKey: "ManageCollectionItems" }, // ✅ ensure visible
  { to: "/admin/media",             labelKey: "ManageMedia" },
  { to: "/admin/listings",          labelKey: "ManageListings" },
  { to: "/admin/orders",            labelKey: "Orders" },
  { to: "/admin/listing-offers",    labelKey: "ManageListingOffers" },
  { to: "/admin/listing-promotions",labelKey: "ManageListingPromotions" },
  { to: "/admin/reports",           labelKey: "ManageReports" },
  { to: "/admin/partner-requests",  labelKey: "Partner Requests" },
  { to: "/admin/invoices",          labelKey: "Invoices" },
  { to: "/admin/store-settings",    labelKey: "Store Management" },
];

export default function AdminLayout() {
  const { t, lang } = useLang();
  const { pathname } = useLocation();
  const isMobile = useIsMobile(1024);
  const [open, setOpen] = useState(true);     // desktop collapse/expand
  const [drawer, setDrawer] = useState(false); // mobile drawer
  const dir = lang === "ar" ? "rtl" : "ltr";

  // Default: open on desktop, closed on mobile
  useEffect(() => {
    setOpen(!isMobile);
    setDrawer(false);
  }, [isMobile]);

  const arrow = useMemo(
    () => (dir === "rtl" ? (open ? "›" : "‹") : (open ? "‹" : "›")),
    [open, dir]
  );

  // Sidebar content as a component so we can reuse for mobile drawer
  const SidebarContent = (
    <div className="h-full flex flex-col">
      {/* Header with arrow toggle (desktop only) */}
      {!isMobile && (
        <div className="h-12 border-b flex items-center justify-end px-2">
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            className="btn btn-ghost btn-xs"
            aria-label={open ? (t("Hide sidebar") || "Hide sidebar") : (t("Show sidebar") || "Show sidebar")}
            title={open ? (t("Hide sidebar") || "Hide sidebar") : (t("Show sidebar") || "Show sidebar")}
          >
            {arrow}
          </button>
        </div>
      )}

      <nav className="px-2 py-3 flex-1 overflow-auto">
        {/* Title row */}
        <div className={`px-3 text-xs uppercase tracking-wide opacity-70 mb-2 ${open ? "" : "text-center"}`}>
          {open ? t("admin") : "⚙️"}
        </div>

        {/* Links */}
        <ul className="m-0 p-0 space-y-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.to} className="list-none">
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  [
                    "flex items-center rounded-lg px-3 py-2 transition",
                    "hover:bg-base-300/50",
                    isActive || pathname === item.to || (item.to !== "/admin" && pathname.startsWith(item.to))
                      ? "bg-base-300 font-medium"
                      : "bg-transparent",
                    open ? "justify-start gap-3" : "justify-center",
                  ].join(" ")
                }
                end={item.to === "/admin"}
              >
                {/* Minimal icon placeholder box to keep alignment clean (no dots) */}
                <span className={`inline-block rounded bg-base-300 ${open ? "w-5 h-5" : "w-7 h-7"}`} />

                {/* Text hidden in collapsed mode */}
                {open && <span className="truncate">{t(item.labelKey) || item.labelKey}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );

  return (
    <div dir={dir} className="max-w-screen-2xl mx-auto px-4 py-4">
      {/* Top bar (mobile) */}
      {isMobile && (
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">{t("admin") || "Admin"}</h1>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setDrawer(true)}
            aria-label={t('Open admin menu') || 'Open admin menu'}
          >
            {/* burger icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
            {t("menu") || "Menu"}
          </button>
        </div>
      )}

      <div className="flex gap-4">
        {/* Desktop sidebar */}
        {!isMobile && (
          <aside
            className={`bg-base-200 rounded-box border h-fit transition-all duration-200 ${
              open ? "w-64" : "w-16"
            }`}
          >
            {SidebarContent}
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="card bg-base-100 border">
            <div className="card-body">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile drawer */}
      {isMobile && drawer && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setDrawer(false)}
            aria-hidden="true"
          />
          <aside
            className={`absolute inset-y-0 ${dir === "rtl" ? "right-0" : "left-0"} w-72 bg-base-200 border shadow-xl rounded-none`}
            role="dialog"
            aria-modal="true"
          >
            <div className="h-12 border-b flex items-center justify-between px-3">
              <span className="font-semibold">{t("admin") || "Admin"}</span>
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                onClick={() => setDrawer(false)}
                aria-label={t("Hide sidebar") || "Hide sidebar"}
              >
                ✕
              </button>
            </div>
            {SidebarContent}
          </aside>
        </div>
      )}
    </div>
  );
}

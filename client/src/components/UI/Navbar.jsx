import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import ThemeToggle from "./ThemeToggle.jsx";
import LangSwitcher from "./LangSwitcher.jsx";

const labels = {
  ar: { home: "الرئيسية", offers: "العروض", stores: "المتاجر", categories: "الأقسام", search: "بحث..." },
  en: { home: "Home", offers: "Offers", stores: "Stores", categories: "Categories", search: "Search..." },
};
const items = [
  { to: "/", key: "home" },
  { to: "/offers", key: "offers" },
  { to: "/stores", key: "stores" },
  { to: "/categories", key: "categories" },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "ar");
  useEffect(() => {
    const onChange = () => setLang(localStorage.getItem("lang") || "ar");
    window.addEventListener("langchange", onChange);
    return () => window.removeEventListener("langchange", onChange);
  }, []);
  const Menu = useMemo(() => (
    <ul className="menu menu-sm lg:menu-horizontal gap-1 lg:gap-2">
      {items.map((it) => (
        <li key={it.to} onClick={() => setOpen(false)}>
          <NavLink to={it.to} className={({ isActive }) => (isActive || pathname === it.to ? "nav-item nav-item-active" : "nav-item")}>
            {labels[lang][it.key]}
          </NavLink>
        </li>
      ))}
    </ul>
  ), [pathname, lang]);

  const rtl = lang === "ar";
  return (
    <div className="nav-shell">
      <nav className="nav-row" dir={rtl ? "rtl" : "ltr"} lang={lang}>
        <div className="flex items-center gap-2">
          <button aria-label="menu" className="btn btn-ghost btn-square lg:hidden" onClick={() => setOpen(v => !v)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <Link to="/" className="flex items-center gap-2 px-1">
            <span className="inline-grid place-items-center size-9 rounded-2xl bg-primary text-primary-content font-bold">س</span>
            <div className="font-extrabold text-lg leading-tight">السوق الحر</div>
          </Link>
        </div>
        <div className="hidden lg:block">{Menu}</div>
        <div className="flex items-center gap-1 lg:gap-2">
          <form className="hidden md:flex items-center gap-2" role="search" onSubmit={(e) => e.preventDefault()}>
            <label className="input input-bordered input-sm rounded-xl flex items-center gap-2 w-56" dir="ltr">
              <input type="search" placeholder={labels[lang].search} className="grow" />
              <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="2" d="m21 21-4.3-4.3M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
              </svg>
            </label>
          </form>
          <LangSwitcher />
          <ThemeToggle />
        </div>
      </nav>
      {open && (
        <div className="lg:hidden border-t border-base-200 bg-base-100" dir={rtl ? "rtl" : "ltr"}>
          <div className="px-4 py-2 max-w-7xl mx-auto">{Menu}</div>
        </div>
      )}
    </div>
  );
}

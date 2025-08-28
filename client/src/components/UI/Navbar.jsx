// client/src/components/Navbar.jsx
import { useEffect, useRef, useState } from 'react';
import { Link } from "react-router-dom";
import LangSwitcher from "@/components/UI/LangSwitcher.jsx";
import CartButton from "@/components/UI/CartButton.jsx";
import AccountMenu from "@/components/UI/AccountMenu.jsx";
import ThemeToggle from "@/components/UI/ThemeToggle.jsx";
import useIsMobile from "@/hooks/useIsMobile";
import { useLang } from "@/context/LangProvider";
import SearchBar from "@/components/UI/SearchBar";

const CATS = [
  { to: '/c/electronics', en: 'Electronics', ar: 'الإلكترونيات' },
  { to: '/c/computers',   en: 'Computers',   ar: 'الحواسيب'     },
  { to: '/c/fashion',     en: 'Fashion',     ar: 'الأزياء'      },
  { to: '/c/books',       en: 'Books',       ar: 'الكتب'        },
  { to: '/c/games',       en: 'Games',       ar: 'الألعاب'      },
];

 

function DesktopBar() {
  const { t, lang } = useLang();
  const label = (c) => (lang === 'en' ? c.en : c.ar);
  const [catsOpen, setCatsOpen] = useState(false);

  return (
    <div className="navbar max-w-screen-2xl mx-auto px-4" onMouseLeave={() => setCatsOpen(false)}>
      <div className="navbar-start gap-2">
        <Link to="/" className="btn btn-ghost text-xl">{t('brand')}</Link>
        <ul className="menu menu-horizontal px-2">
          <li><Link to="/">{t("home")}</Link></li>
          <li><Link to="/collections">{t("offers")}</Link></li>
          <li><Link to="/stores">{t("stores")}</Link></li>
          <li className="relative">
            <button className="btn btn-ghost btn-sm" onMouseEnter={()=>setCatsOpen(true)} onClick={()=>setCatsOpen(v=>!v)}>{t('categories')}</button>
            {catsOpen && (
              <ul className="p-2 bg-base-100 min-w-56 shadow rounded-box absolute z-50 mt-2" onMouseLeave={()=>setCatsOpen(false)}>
                {CATS.map(c => (
                  <li key={c.to}><Link to={c.to} onClick={()=>setCatsOpen(false)}>{label(c)}</Link></li>
                ))}
              </ul>
            )}
          </li>
          {/* C2C */}
          <li><Link to="/listings">{t("listings")}</Link></li>
          <li><Link to="/account/listings/new">{t("sell")}</Link></li>
        </ul>
      </div>

      <div className="navbar-md">
        <SearchBar wide />
      </div>

      <div className="navbar-end gap-2">
        <LangSwitcher />
        <ThemeToggle />
        <CartButton />
        <AccountMenu />
      </div>
    </div>
  );
}

function MobileBar() {
  const { t, lang } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const label = (c) => (lang === 'en' ? c.en : c.ar);

  return (
    <>
      <div className="navbar max-w-screen-2xl mx-auto px-4">
        <div className="navbar-start">
          <Link to="/" className="btn btn-ghost text-lg p-0">{t('brand')}</Link>
        </div>
        <div className="navbar-end gap-2">
          <CartButton />
          <AccountMenu />
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 pb-2">
        <div className="navbar">
          <SearchBar />
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 pb-2 flex items-center justify-between">
        <div className={`dropdown ${menuOpen ? 'dropdown-open' : ''}`}>
          <button
            tabIndex={0}
            className="btn btn-ghost btn-sm"
            onClick={()=>setMenuOpen(v=>!v)}
            aria-label="menu"
            aria-expanded={menuOpen}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
            {t("menu") || "Menu"}
          </button>

          <ul
            tabIndex={0}
            className="menu dropdown-content mt-2 w-64 bg-base-100 p-2 shadow rounded-box z-50"
          >
            <li><Link to="/">{t("home")}</Link></li>
            <li><Link to="/collections">{t("offers")}</Link></li>
            <li><Link to="/stores">{t("stores")}</Link></li>
            <li>
              <button type="button" onClick={(e)=>{e.stopPropagation(); setCatsOpen(v=>!v);}}>
                {t("categories")} ▾
              </button>
              {catsOpen && (
                <ul className="p-2">
                  {CATS.map(c => (
                    <li key={c.to}><Link to={c.to}>{label(c)}</Link></li>
                  ))}
                </ul>
              )}
            </li>
            {/* C2C */}
            <li><Link to="/listings">{t("listings")}</Link></li>
            <li><Link to="/account/listings/new">{t("sell")}</Link></li>
          </ul>
        </div>

        <div className="flex items-center gap-2">
          <LangSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </>
  );
}

function Navbar() {
  const isMobile = useIsMobile(1024);
  return (
    <>
      {isMobile ? <MobileBar /> : <DesktopBar />}
    </>
  );
}

export default Navbar;

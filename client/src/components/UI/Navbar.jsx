import { useState } from "react";
import { Link } from "react-router";
import LangSwitcher from "@/components/UI/LangSwitcher.jsx";
import CartButton from "@/components/UI/CartButton.jsx";
import ProfileButton from "@/components/UI/ProfileButton.jsx";
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

  return (
    <div className="navbar max-w-screen-2xl mx-auto px-4">
      <div className="navbar-start gap-2">
        <Link to="/" className="btn btn-ghost text-xl">Free Market</Link>
        <ul className="menu menu-horizontal px-2">
          <li><Link to="/">{t("home")}</Link></li>
          <li><Link to="/offers">{t("offers")}</Link></li>
          <li><Link to="/shops">{t("stores")}</Link></li>
          <li tabIndex={0}>
            <details>
              <summary>{t("categories")}</summary>
              <ul className="p-2 bg-base-100 min-w-56">
                {CATS.map(c => (
                  <li key={c.to}><Link to={c.to}>{label(c)}</Link></li>
                ))}
              </ul>
            </details>
          </li>
        </ul>
      </div>

      <div className="navbar-md">
        <SearchBar wide />
      </div>

      <div className="navbar-end gap-2">
        <LangSwitcher />
        <ThemeToggle />
        <CartButton />
        <ProfileButton />
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
    <div className="border-b">
      <div className="navbar max-w-screen-2xl mx-auto px-4">
        <div className="navbar-start">
          <Link to="/" className="btn btn-ghost text-lg p-0">Free Market</Link>
        </div>
        <div className="navbar-end gap-2">
          <CartButton />
          <ProfileButton />
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
            <li><Link to="/offers">{t("offers")}</Link></li>
            <li><Link to="/shops">{t("stores")}</Link></li>
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
          </ul>
        </div>

        <div className="flex items-center gap-2">
          <LangSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

function Navbar() {
  const isMobile = useIsMobile(1024);
  return (
    <nav className="w-full bg-base-100 sticky top-0 z-40">
      {isMobile ? <MobileBar /> : <DesktopBar />}
    </nav>
  );
}

export default Navbar;

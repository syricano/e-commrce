import { Link } from "react-router";
import LangSwitcher from "@/components/UI/LangSwitcher.jsx";
import CartButton from "@/components/UI/CartButton.jsx";
import ProfileButton from "@/components/UI/ProfileButton.jsx";
import ThemeToggle from "@/components/UI/ThemeToggle.jsx";
import useIsMobile from "@/hooks/useIsMobile";
import { useLang } from "@/context/LangProvider";
import { useAuth } from "@/context";

const NavbarLinks = () => {
  const { t } = useLang();
  return (
    <ul className="menu menu-horizontal px-2">
      <li><Link to="/">{t("home")}</Link></li>
      <li><Link to="/offers">{t("offers")}</Link></li>
      <li><Link to="/shops">{t("stores")}</Link></li>
      <li tabIndex={0}>
        <details>
          <summary>{t("categories")}</summary>
          <ul className="p-2 bg-base-100">
            <li><Link to="/c/electronics">{t("electronics")}</Link></li>
            <li><Link to="/c/computers">{t("computers")}</Link></li>
            <li><Link to="/c/books">{t("books")}</Link></li>
            <li><Link to="/c/games">{t("games")}</Link></li>
            <li><Link to="/c/fashion">{t("fashion")}</Link></li>
          </ul>
        </details>
      </li>
    </ul>
  );
};

const AuthButtons = () => {
  const { isAuthenticated, logout } = useAuth?.() || {};
  const { t, lang } = useLang();

  if (isAuthenticated) {
    return (
      <button onClick={logout} className="btn btn-sm">
        {t("logout")}
      </button>
    );
  }
  // keep RTL/LTR spacing correct
  return (
    <div className="flex items-center gap-1">
      <Link to="/signin" className="btn btn-sm">{t("signin")}</Link>
      <Link to="/signup" className="btn btn-sm btn-primary">{t("signup")}</Link>
    </div>
  );
};

const DesktopBar = () => {
  const { t } = useLang();
  return (
    <div className="border-b">
      <div className="navbar max-w-screen-2xl mx-auto px-4">
        <div className="navbar-start gap-2">
          <Link to="/" className="btn btn-ghost text-xl">{t("brand")}</Link>
          <NavbarLinks />
        </div>
        <div className="navbar-end gap-2">
          <LangSwitcher />
          <ThemeToggle />
          <CartButton />
          <ProfileButton />
          <AuthButtons />
        </div>
      </div>
    </div>
  );
};

const MobileBar = () => {
  const { t } = useLang();
  return (
    <div className="border-b">
      {/* Row 1 */}
      <div className="navbar max-w-screen-2xl mx-auto px-4">
        <div className="navbar-start">
          <Link to="/" className="btn btn-ghost text-lg p-0">{t("brand")}</Link>
        </div>
        <div className="navbar-end gap-2">
          <CartButton />
          <ProfileButton />
        </div>
      </div>
      {/* Row 2 */}
      <div className="max-w-screen-2xl mx-auto px-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="dropdown">
            <button tabIndex={0} className="btn btn-ghost btn-sm" aria-label="menu">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
              {t("menu")}
            </button>
            <ul tabIndex={0} className="menu dropdown-content mt-2 w-64 bg-base-100 p-2 shadow rounded-box z-50">
              <li><Link to="/">{t("home")}</Link></li>
              <li><Link to="/offers">{t("offers")}</Link></li>
              <li><Link to="/shops">{t("stores")}</Link></li>
            </ul>
          </div>
          <div className="flex items-center gap-2">
            <LangSwitcher />
            <ThemeToggle />
          </div>
        </div>
        {/* Row 3 */}
        <div className="mt-2 overflow-x-auto">
          <ul className="menu menu-horizontal w-max mx-auto gap-1">
            <li><Link className="btn btn-sm btn-ghost" to="/c/electronics">{t("electronics")}</Link></li>
            <li><Link className="btn btn-sm btn-ghost" to="/c/computers">{t("computers")}</Link></li>
            <li><Link className="btn btn-sm btn-ghost" to="/c/books">{t("books")}</Link></li>
            <li><Link className="btn btn-sm btn-ghost" to="/c/games">{t("games")}</Link></li>
            <li><Link className="btn btn-sm btn-ghost" to="/c/fashion">{t("fashion")}</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default function Navbar() {
  const isMobile = useIsMobile(1024);
  return (
    <nav className="w-full bg-base-100 sticky top-0 z-40">
      {isMobile ? <MobileBar /> : <DesktopBar />}
    </nav>
  );
}

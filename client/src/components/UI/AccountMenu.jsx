import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context";
import { useLang } from "@/context/LangProvider";
import useIsMobile from "@/hooks/useIsMobile";

function AccountMenu() {
  const nav = useNavigate();
  const { isAuthenticated, user, logout, loading } = useAuth() || {};
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile(1024);

  const handleClick = () => {
    if (loading) return; // avoid redirect while auth is bootstrapping
    if (!isAuthenticated) return nav('/signin');
    setOpen(v => !v);
  };

  const go = (path) => { setOpen(false); nav(path); };
  const isAdmin = user?.role === "admin" || user?.role === "staff";
  const isMerchant = user?.role === 'seller' || user?.role === 'staff';

  // Alignment: desktop only
  const alignClass = !isMobile ? (lang === 'ar' ? 'left-0' : 'right-0') : '';

  return (
    <div className="dropdown">
      <button className="btn btn-ghost btn-circle btn-sm" aria-label="profile" onClick={handleClick} aria-busy={loading}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm7 9a7 7 0 0 0-14 0Z"/></svg>
      </button>

      {isAuthenticated && open && (
        <ul className={`menu dropdown-content mt-2 w-60 bg-base-100 p-2 shadow rounded-box z-50 ${alignClass}`}>
          <li className="px-3 py-2 text-sm opacity-70 truncate">{user?.email || t("profile")}</li>

          <li><button onClick={() => go("/account/profile")}>{t("profile") || "Profile"}</button></li>
          <li><button onClick={() => go("/account/listings")}>{t("My Listings") || "My Listings"}</button></li>
          <li><button onClick={() => go("/account/orders")}>{t("My Orders") || "My Orders"}</button></li>
          <li><button onClick={() => go("/account/messages")}>{t("Messages") || "Messages"}</button></li>

          {(isAdmin || isMerchant) && (
            <>
              <li className="mt-1 border-t" />
              <li className="px-3 pt-2 text-xs font-semibold opacity-70">{isAdmin ? (t('Admin Management') || 'Admin Management') : (t('Merchant Management') || 'Merchant Management')}</li>
              {isAdmin && (
                <li><button onClick={() => go("/admin")}>{t("Dashboard") || "Dashboard"}</button></li>
              )}
              {!isAdmin && isMerchant && (
                <li><button onClick={() => go("/merchant")}>{t("Store Management") || 'Store Management'}</button></li>
              )}
            </>
          )}

          <li className="mt-1 border-t" />
          <li><button onClick={() => { setOpen(false); logout(); }}>{t("logout") || "Logout"}</button></li>
        </ul>
      )}
    </div>
  );
}

export default AccountMenu;

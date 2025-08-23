import { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "@/context";
import { useLang } from "@/context/LangProvider";

function ProfileButton() {
  const { isAuthenticated, user, logout } = useAuth?.() || {};
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <Link to="/signin" className="btn btn-ghost btn-circle btn-sm" aria-label="profile">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth="2" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm7 9a7 7 0 0 0-14 0Z"/>
        </svg>
      </Link>
    );
  }

  return (
    <div className="dropdown dropdown-end">
      <button
        className="btn btn-ghost btn-circle btn-sm"
        aria-label="profile"
        onClick={() => setOpen(v => !v)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth="2" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm7 9a7 7 0 0 0-14 0Z"/>
        </svg>
      </button>
      {open && (
        <ul className="menu dropdown-content mt-2 w-56 bg-base-100 p-2 shadow rounded-box z-50">
          <li className="px-3 py-2 text-sm opacity-70">{user?.email || t("profile")}</li>
          <li><Link to="/profile">{t("profile")}</Link></li>
          <li><button onClick={logout}>{t("logout")}</button></li>
        </ul>
      )}
    </div>
  );
}

export default ProfileButton;

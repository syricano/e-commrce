// client/src/components/UI/ProfileButton.jsx
import { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "@/context";
import { useLang } from "@/context/LangProvider";

function ProfileButton() {
  const { isAuthenticated, user, logout } = useAuth();
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

  const close = () => setOpen(false);

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

          {/* Profile matches backend: self profile */}
          <li>
            <Link to="/account/profile" onClick={close}>
              {t("profile") || "Profile"}
            </Link>
          </li>

          {/* Orders: self purchases */}
          <li>
            <Link to="/account/orders" onClick={close}>
              My Orders
            </Link>
          </li>

          {/* C2C listings owned by user */}
          <li>
            <Link to="/listings/mine" onClick={close}>
              My Listings
            </Link>
          </li>

          {/* Messages for C2C */}
          <li>
            <Link to="/messages" onClick={close}>
              Messages
            </Link>
          </li>

          {/* Seller onboarding */}
          <li>
            <Link to="/partner/apply" onClick={close}>
              {t("becomeSeller") || "Become a seller?"}
            </Link>
          </li>

          <li>
            <button
              onClick={() => {
                close();
                logout();
              }}
            >
              {t("logout") || "Logout"}
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}

export default ProfileButton;

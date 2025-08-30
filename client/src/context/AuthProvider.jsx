// client/src/context/AuthProvider.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axiosInstance from "@/config/axiosConfig";
import { login as apiLogin, logout as apiLogout, getMe } from "@/services";
import { toast } from "react-hot-toast";
import { useLang } from "@/context/LangProvider";
import { errorHandler } from "@/utils";

const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
  role: "customer",
  loginWithCredentials: async () => false,
  logout: async () => {},
});

function AuthProvider({ children }) {
  const { t } = useLang();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // Accept ?token=... from /api/auth/google/callback redirect
  useEffect(() => {
    const usp = new URLSearchParams(window.location.search);
    const t = usp.get("token");
    if (t) {
      localStorage.setItem("token", t);
      setToken(t);
      usp.delete("token");
      const clean = `${window.location.pathname}${usp.toString() ? `?${usp}` : ""}${window.location.hash}`;
      window.history.replaceState({}, "", clean);
    }
  }, []);

  // Reflect token to axios header; backend also accepts cookie
  useEffect(() => {
    if (token) {
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete axiosInstance.defaults.headers.common.Authorization;
    }
  }, [token]);

  // Bootstrap session from /api/auth/me (returns the user object directly)
  useEffect(() => {
    let live = true;
    getMe()
      .then((me) => {
        if (live) setUser(me ?? null);
      })
      .catch(() => {
        if (live) setUser(null);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [token]);

  const loginWithCredentials = ({ email, password }) =>
    apiLogin({ email, password })
      .then(({ token: t, user: u }) => {
        if (t) {
          localStorage.setItem("token", t);
          setToken(t);
        }
        setUser(u ?? null);
        toast.success(t('Signed in') || 'Signed in');
        return true;
      })
      .catch((e) => {
        errorHandler(e, t('Login failed') || 'Login failed');
        return false;
      });

  const logout = () =>
    apiLogout()
      .catch(() => {})
      .finally(() => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        toast.success(t('Logged out') || 'Logged out');
      });

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!user,
      role: user?.role || "customer",
      loginWithCredentials,
      logout,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
export default AuthProvider;

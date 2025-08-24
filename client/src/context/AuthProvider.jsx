// client/src/context/AuthProvider.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login as apiLogin, logout as apiLogout, getMe } from "@/data";
import { toast } from "react-hot-toast";
import { errorHandler } from "@/utils";

const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
  role: "guest",
  loginWithCredentials: async () => false,
  logout: async () => {},
});

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // Pick up ?token=... once (e.g., after OAuth redirect)
  useEffect(() => {
    const usp = new URLSearchParams(window.location.search);
    const t = usp.get("token");
    if (t) {
      localStorage.setItem("token", t);
      setToken(t);
      usp.delete("token");
      const clean = `${window.location.pathname}${
        usp.toString() ? `?${usp}` : ""
      }${window.location.hash}`;
      window.history.replaceState({}, "", clean);
    }
  }, []);

  // Bootstrap session from API (cookie or bearer on axios)
  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const me = await getMe();
        if (live && me) setUser(me);
      } catch {
        // not logged in or token invalid
        if (live) {
          setUser(null);
        }
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, [token]);

  const loginWithCredentials = async ({ email, password }) => {
    try {
      const { token: t, user: u } = await apiLogin({ email, password });
      if (t) {
        localStorage.setItem("token", t);
        setToken(t);
      }
      if (u) setUser(u);
      toast.success("Signed in");
      return true;
    } catch (e) {
      errorHandler(e, "Login failed");
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch {
      // ignore API logout errors
    }
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    toast.success("Logged out");
  };

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

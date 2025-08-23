import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext({
  user: null, token: null, loading: true, isAuthenticated: false, role: "guest",
  loginWithCredentials: async () => ({}), logout: async () => {}
});

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    try {
      // keep lightweight; real decode handled elsewhere
      setUser({ id: 'me' }); 
    } catch {
      localStorage.removeItem("token"); setToken(null);
    } finally { setLoading(false); }
  }, [token]);

  const loginWithCredentials = async ({ email, password }) => {
    // wire to your API; on success:
    const t = "dummy-token";
    localStorage.setItem("token", t); setToken(t); setUser({ id: 'me' });
  };
  const logout = async () => {
    localStorage.removeItem("token"); setToken(null); setUser(null);
  };

  const value = useMemo(() => ({
    user, token, loading,
    isAuthenticated: !!user,
    role: "customer",
    loginWithCredentials, logout
  }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

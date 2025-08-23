import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import {
  login as apiLogin,
  logout as apiLogout,
  getProfileById,
  createProfile,
  updateProfile,
  changePassword as apiChangePassword,
  requestPasswordReset as apiRequestPasswordReset,
  confirmPasswordReset as apiConfirmPasswordReset
} from '@/data';
import axiosInstance from '@/config/axiosConfig';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);         // { id, email, role, ... }
  const [profile, setProfile] = useState(null);   // { id, userId, ... }
  const [loading, setLoading] = useState(true);

  // Bootstrap: try /auth/me (works with cookie or header token)
  const refreshAuth = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get('/auth/me');
      setUser(data);
      return data;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  // Load current user's profile
  const refreshProfile = useCallback(async (uid) => {
    if (!uid) return null;
    try {
      const data = await getProfileById(uid); // we use profile id == user id? if not, backend controller can map; fallback:
      setProfile(data);
      return data;
    } catch {
      setProfile(null);
      return null;
    }
  }, []);

  // Init on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      const me = await refreshAuth();
      if (me?.id) {
        // Try profile where PK equals userId; if your API uses separate profile id,
        // replace with a dedicated /profiles?userId=me.id fetch.
        try {
          const p = await getProfileById(me.id);
          setProfile(p);
        } catch {
          setProfile(null);
        }
      }
      setLoading(false);
    })();
  }, [refreshAuth]);

  // Credentials login
  const loginWithCredentials = async (credentials) => {
    const res = await apiLogin(credentials); // returns { token, user }
    // token is set in localStorage by axios interceptor usage; cookie also set server-side on success if you implement it.
    await refreshAuth();
    if (res?.user?.id) await refreshProfile(res.user.id);
    return res;
  };

  // Logout
  const logout = async () => {
    try { await apiLogout(); } catch {}
    setUser(null);
    setProfile(null);
    // client may also remove local token if you store it
    localStorage.removeItem('token');
  };

  // Upsert profile for current user
  const upsertMyProfile = async (patch) => {
    if (!user?.id) throw new Error('Not authenticated');
    if (profile?.id) {
      const updated = await updateProfile(profile.id, patch);
      setProfile(updated);
      return updated;
    }
    const created = await createProfile({ userId: user.id, ...patch });
    setProfile(created);
    return created;
  };

  // Password flows
  const changePassword = async ({ oldPassword, newPassword }) => {
    if (!user?.id) throw new Error('Not authenticated');
    return apiChangePassword({ oldPassword, newPassword });
  };

  const requestPasswordReset = async ({ email }) => {
    return apiRequestPasswordReset({ email });
  };

  const confirmPasswordReset = async ({ token, newPassword }) => {
    return apiConfirmPasswordReset({ token, newPassword });
  };

  const value = useMemo(() => ({
    // state
    user,
    profile,
    loading,
    isAuthenticated: !!user,

    // auth
    loginWithCredentials,
    logout,
    refreshAuth,

    // profile
    refreshProfile: () => refreshProfile(user?.id),
    upsertMyProfile,

    // password
    changePassword,
    requestPasswordReset,
    confirmPasswordReset,

    // convenience
    role: user?.role || 'guest'
  }), [user, profile, loading, refreshAuth, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
export default AuthContext;

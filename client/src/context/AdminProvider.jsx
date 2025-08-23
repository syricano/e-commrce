import { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthProvider.jsx';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const { role, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && role === 'admin';

  const value = useMemo(() => ({ isAdmin }), [isAdmin]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export const useAdmin = () => useContext(AdminContext);

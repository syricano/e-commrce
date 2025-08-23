import { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthProvider.jsx';

const SellerContext = createContext(null);

export function SellerProvider({ children }) {
  const { role, isAuthenticated } = useAuth();
  const isSeller = isAuthenticated && role === 'seller';
  const value = useMemo(() => ({ isSeller }), [isSeller]);
  return <SellerContext.Provider value={value}>{children}</SellerContext.Provider>;
}

export const useSeller = () => useContext(SellerContext);

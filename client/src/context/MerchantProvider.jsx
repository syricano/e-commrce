import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context';
import axiosInstance from '@/config/axiosConfig';

const MerchantContext = createContext({ isMerchant: false, stores: [], loading: true });

export default function MerchantProvider({ children }) {
  const { user, role } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  const isMerchant = role === 'seller' || role === 'staff' || role === 'admin';

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      try {
        if (isMerchant && user?.id) {
          const res = await axiosInstance.get('/stores', { params: { ownerUserId: user.id, limit: 200 } });
          const rows = res?.data?.items || res?.data || [];
          if (alive) setStores(Array.isArray(rows) ? rows : []);
        } else if (alive) {
          setStores([]);
        }
      } catch {
        if (alive) setStores([]);
      } finally { if (alive) setLoading(false); }
    };
    load();
    return () => { alive = false; };
  }, [user?.id, isMerchant]);

  const value = useMemo(() => ({ isMerchant, stores, loading }), [isMerchant, stores, loading]);
  return <MerchantContext.Provider value={value}>{children}</MerchantContext.Provider>;
}

export const useMerchant = () => useContext(MerchantContext);


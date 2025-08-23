import { createContext, useContext, useMemo, useState } from "react";

const SellerContext = createContext({});

export default function SellerProvider({ children }) {
  const [state] = useState({});
  const value = useMemo(() => state, [state]);
  return <SellerContext.Provider value={value}>{children}</SellerContext.Provider>;
}

export const useSeller = () => useContext(SellerContext);

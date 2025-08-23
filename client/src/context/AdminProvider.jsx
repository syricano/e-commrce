import { createContext, useContext, useMemo, useState } from "react";

const AdminContext = createContext({});

export default function AdminProvider({ children }) {
  const [state] = useState({});
  const value = useMemo(() => state, [state]);
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export const useAdmin = () => useContext(AdminContext);

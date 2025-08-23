import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext({ items: [], add: () => {}, remove: () => {} });

export default function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const add = (item) => setItems((xs) => [...xs, item]);
  const remove = (id) => setItems((xs) => xs.filter((x) => x.id !== id));

  const value = useMemo(() => ({ items, add, remove }), [items]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);

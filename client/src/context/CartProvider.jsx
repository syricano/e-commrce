import { createContext, useContext, useMemo, useState } from 'react';

const defaultValue = {
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQty: () => {},
  clear: () => {},
  totals: { itemsSubtotalAmount: 0, grandTotalAmount: 0 },
};

const CartContext = createContext(defaultValue);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = (item) => setItems((prev) => {
    const i = prev.findIndex(p => p.offerId === item.offerId);
    if (i === -1) return [...prev, { ...item, qty: item.qty || 1 }];
    const copy = [...prev];
    copy[i] = { ...copy[i], qty: (copy[i].qty || 1) + (item.qty || 1) };
    return copy;
  });

  const removeItem = (offerId) => setItems((p) => p.filter(x => x.offerId !== offerId));
  const updateQty = (offerId, qty) => setItems((p) => p.map(x => x.offerId === offerId ? { ...x, qty } : x));
  const clear = () => setItems([]);

  const totals = useMemo(() => {
    const itemsSubtotalAmount = items.reduce((s, it) => s + (it.priceAmount || 0) * (it.qty || 1), 0);
    return { itemsSubtotalAmount, grandTotalAmount: itemsSubtotalAmount };
  }, [items]);

  const value = useMemo(() => ({ items, addItem, removeItem, updateQty, clear, totals }), [items, totals]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
export default CartContext;

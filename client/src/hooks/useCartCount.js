import { useEffect, useState } from 'react';
import { getCurrentCart } from '@/services';

export default function useCartCount() {
  const [count, setCount] = useState(0);

  const load = async () => {
    try {
      const res = await getCurrentCart();
      const data = res?.data || res || {};
      const items = Array.isArray(data.items) ? data.items : Array.isArray(data?.cart?.items) ? data.cart.items : [];
      const c = items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
      setCount(c);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    load();
    const onUpdate = () => load();
    window.addEventListener('cart:updated', onUpdate);
    return () => window.removeEventListener('cart:updated', onUpdate);
  }, []);

  return count;
}


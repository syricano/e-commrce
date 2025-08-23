import { useMemo } from 'react';
import { useCart } from '@/context';

const CartButton = () => {
  const cart = useCart();
  const items = cart?.items || [];
  const count = useMemo(() => items.reduce((s, i) => s + (i.qty || 1), 0), [items]);

  return (
    <a href="/cart" className="btn btn-ghost btn-circle btn-sm" aria-label="عربة التسوق">
      <div className="indicator">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 m-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth="2" d="M3 3h2l.4 2M7 13h9l3-8H6.4M7 13L5.4 5M7 13l-2 9m13-9 2 9M10 22a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"/>
        </svg>
        {count > 0 && <span className="badge badge-xs indicator-item">{count}</span>}
      </div>
    </a>
  );
};

export default CartButton;

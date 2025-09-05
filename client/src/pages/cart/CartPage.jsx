import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCurrentCart,
  updateCartItem,
  deleteCartItem,
  clearCurrentCart,
} from '@/services/api';
import { useLang } from '@/context/LangProvider';
import CurrencySwitcher from '@/components/cart/CurrencySwitcher.jsx';

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, Number.isFinite(+n) ? +n : 0));
const fmt = (amount, cur) => `${Number(amount || 0).toFixed(2)} ${cur}`;

export default function CartPage() {
  const { t } = useLang();
  const navigate = useNavigate();

  const [busy, setBusy] = useState(false);
  const [cart, setCart] = useState(null);
  const [items, setItems] = useState([]);

  const load = useCallback(async () => {
    try {
      setBusy(true);
      const res = await getCurrentCart();
      setCart(res.cart || null);
      setItems(res.items || []);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener('cart:updated', handler);
    return () => window.removeEventListener('cart:updated', handler);
  }, [load]);

  const onQtyChange = async (row, next) => {
    const q = clamp(next, 1, 99);
    await updateCartItem(row.id, { quantity: q });
    await load();
  };

  const onRemove = async (row) => {
    await deleteCartItem(row.id);
    await load();
  };

  const onClear = async () => {
    await clearCurrentCart();
    await load();
  };

  const currency = cart?.currency || 'EUR';
  const subtotal = cart?.itemsSubtotalAmount || 0;
  const shipping = cart?.shippingAmount || 0;
  const tax = cart?.taxAmount || 0;
  const discount = cart?.discountAmount || 0;
  const total = cart?.grandTotalAmount || 0;

  return (
    <section className="p-4 max-w-5xl mx-auto space-y-4">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t('Cart') || 'Cart'}</h1>
        <div className="flex items-center gap-2">
          <CurrencySwitcher />
          <button
            type="button"
            onClick={onClear}
            disabled={busy || !items.length}
          >
            {t('Clear cart') || 'Clear cart'}
          </button>
        </div>
      </header>

      {!items.length && (
        <div>
          <p>{t('Your cart is empty') || 'Your cart is empty'}</p>
          <button type="button" onClick={() => navigate('/')}>
            {t('Continue shopping') || 'Continue shopping'}
          </button>
        </div>
      )}

      {!!items.length && (
        <div className="space-y-4">
          <ul className="divide-y">
            {items.map((r) => {
              // B2C
              const prod = r.offer?.variant?.product;
              const tr = Array.isArray(prod?.translations) ? prod.translations[0] : null;
              const titleB2C = tr?.name || prod?.name || (r.offer ? `#${r.offer.id}` : '');

              // Merchant
              const sop = r.storeOffer?.product;
              const titleStore = sop?.name || (r.storeOffer ? `#${r.storeOffer.id}` : '');

              const title = r.offerId ? titleB2C : titleStore;

              // Image (best-effort)
              const img =
                prod?.media?.[0]?.url ||
                sop?.media?.[0]?.url ||
                '';

              const unit = r.display?.unitPriceAmount ?? 0;
              const line = r.display?.lineTotalAmount ?? 0;

              return (
                <li key={r.id} className="py-3 flex items-center gap-3">
                  <div style={{ width: 72, height: 72, background: '#eee', borderRadius: 8, overflow: 'hidden', flex: '0 0 auto' }}>
                    {img ? (
                      <img
                        src={img}
                        alt={title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : null}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {title}
                    </div>
                    {r.offer?.variant?.sku && (
                      <div style={{ fontSize: 12, opacity: 0.7 }}>
                        {(t('SKU') || 'SKU')}: {r.offer.variant.sku}
                      </div>
                    )}
                    {sop?.articleNumber && (
                      <div style={{ fontSize: 12, opacity: 0.7 }}>
                        {(t('SKU') || 'SKU')}: {sop.articleNumber}
                      </div>
                    )}
                    <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>
                      {t('Unit') || 'Unit'}: {fmt(unit, currency)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2" style={{ flex: '0 0 auto' }}>
                    <button type="button" onClick={() => onQtyChange(r, r.quantity - 1)} aria-label={t('Decrease quantity') || 'Decrease quantity'}>-</button>
                    <input
                      value={r.quantity}
                      onChange={(e) => onQtyChange(r, e.target.value)}
                      inputMode="numeric"
                      style={{ width: 48, textAlign: 'center' }}
                    />
                    <button type="button" onClick={() => onQtyChange(r, r.quantity + 1)} aria-label={t('Increase quantity') || 'Increase quantity'}>+</button>
                  </div>

                  <div style={{ width: 120, textAlign: 'right', fontWeight: 600 }}>
                    {fmt(line, currency)}
                  </div>

                  <div style={{ width: 72, textAlign: 'right' }}>
                    <button type="button" onClick={() => onRemove(r)}>
                      {t('Remove') || 'Remove'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="space-y-1" style={{ maxWidth: 360, marginLeft: 'auto' }}>
            <div className="flex justify-between">
              <span>{t('Subtotal') || 'Subtotal'}</span>
              <span>{fmt(subtotal, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('Shipping') || 'Shipping'}</span>
              <span>{fmt(shipping, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('Tax') || 'Tax'}</span>
              <span>{fmt(tax, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('Discount') || 'Discount'}</span>
              <span>-{fmt(discount, currency)}</span>
            </div>
            <hr />
            <div className="flex justify-between font-bold">
              <span>{t('Total') || 'Total'}</span>
              <span>{fmt(total, currency)}</span>
            </div>

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              disabled={!items.length}
              style={{ width: '100%', marginTop: 8 }}
            >
              {t('Proceed to Checkout') || 'Proceed to Checkout'}
            </button>
          </aside>
        </div>
      )}
    </section>
  );
}

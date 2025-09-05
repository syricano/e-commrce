import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMyOrder, createThread } from '@/services';
import { useNavigate } from 'react-router-dom';
import { errorHandler } from '@/utils';
import { useLang } from '@/context/LangProvider';

const fmtMoney = (currency, amount) => {
  const val = Number(amount || 0);
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(val);
  } catch { return `${val.toFixed(2)} ${currency}`; }
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [paying, setPaying] = useState(false);
  const [messaging, setMessaging] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getMyOrder(id)
      .then(async (res) => {
        const ord = res?.data || res || null;
        setOrder(ord);
        // Load order items
        try {
          const r2 = await fetch(`/api/order-items?orderId=${encodeURIComponent(id)}&limit=1000`, { credentials: 'include' });
          const b = await r2.json().catch(() => ({}));
          setItems(Array.isArray(b?.items) ? b.items : Array.isArray(b) ? b : []);
        } catch { setItems([]); }
      })
      .catch((e) => errorHandler(e, t('Failed to load order') || 'Failed to load order'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <section className="p-4">{t('Loading…') || 'Loading…'}</section>;
  if (!order) return <section className="p-4">{t('Not found') || 'Not found'}</section>;

  return (
    <section className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('Order') || 'Order'} #{order.id}</h1>
        <div className="flex items-center gap-2">
          <button
            className="btn btn-primary btn-sm"
            disabled={messaging}
            onClick={async () => {
              const storeIds = Array.from(new Set(items.map((it) => it.storeId).filter((v) => v != null)));
              const listingIds = Array.from(new Set(items.map((it) => it.listingId).filter((v) => v != null)));
              const choices = [
                ...storeIds.map((sid) => ({ type: 'store', id: sid })),
                ...listingIds.map((lid) => ({ type: 'listing', id: lid })),
              ];
              if (choices.length <= 1) {
                setMessaging(true);
                try {
                  const payload = { orderId: Number(id) };
                  if (storeIds.length === 1) payload.storeId = storeIds[0];
                  else if (listingIds.length === 1) payload.listingId = listingIds[0];
                  const res = await createThread(payload);
                  const th = res?.data || res || {};
                  if (th?.id) navigate(`/account/messages?threadId=${th.id}`);
                  } catch (e) {
                  errorHandler(e, t('Failed to start thread') || 'Failed to start thread');
                } finally { setMessaging(false); }
              } else {
                setPickerOpen(true);
              }
            }}
            title={t('Message the seller about this order') || 'Message the seller about this order'}
          >
            {messaging ? '…' : (t('Message Seller') || 'Message Seller')}
          </button>
          <Link to="/account/orders" className="btn btn-sm">{t('Back to orders') || 'Back to orders'}</Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card bg-base-200">
          <div className="card-body">
            <div><span className="opacity-60">{t('Payment') || 'Payment'}:</span> {order.paymentStatus || '—'}</div>
            <div><span className="opacity-60">{t('Confirmed') || 'Confirmed'}:</span> {order.fulfillmentStatus === 'fulfilled' ? 'confirmed' : (order.fulfillmentStatus || '—')}</div>
            <div><span className="opacity-60">{t('Total') || 'Total'}:</span> {fmtMoney(order.currency || 'EUR', order.grandTotalAmount)}</div>
            <div><span className="opacity-60">{t('Placed') || 'Placed'}:</span> {order.placedAt ? new Date(order.placedAt).toLocaleString() : '—'}</div>
            {order.paymentStatus !== 'paid' && (
              <div className="mt-2">
                <button className="btn btn-primary btn-sm" disabled={paying}
                  onClick={async () => {
                    setPaying(true);
                    try {
                      const r = await fetch(`/api/orders/${encodeURIComponent(id)}/pay`, { method: 'POST', credentials: 'include' });
                      const b = await r.json().catch(()=>({}));
                      if (r.ok) setOrder(b);
                    } finally { setPaying(false); }
                  }}
                >{paying ? '…' : (t('Pay Now') || 'Pay Now')}</button>
              </div>
            )}
          </div>
        </div>
        <div className="card bg-base-200">
          <div className="card-body">
            <div className="font-semibold mb-2">{t('Summary') || 'Summary'}</div>
            <div>{t('Items subtotal') || 'Items subtotal'}: {fmtMoney(order.currency || 'EUR', order.itemsSubtotalAmount)}</div>
            <div>{t('Shipping') || 'Shipping'}: {fmtMoney(order.currency || 'EUR', order.shippingAmount)}</div>
            <div>{t('Tax') || 'Tax'}: {fmtMoney(order.currency || 'EUR', order.taxAmount)}</div>
            <div>{t('Discount') || 'Discount'}: {fmtMoney(order.currency || 'EUR', order.discountAmount || 0)}</div>
          </div>
        </div>
      </div>

      <div className="card bg-base-200">
        <div className="card-body">
          <div className="font-semibold">{t('Items') || 'Items'}</div>
          {items.length === 0 ? (
            <div className="opacity-60 text-sm">{t('No line items to display.') || 'No line items to display.'}</div>
          ) : (
            <ul className="text-sm divide-y">
              {items.map((it) => (
                <li key={it.id} className="py-1 flex items-center justify-between">
                  <div className="truncate">
                    {it.productSnapshotName || `#${it.id}`}
                  </div>
                  <div className="opacity-70">x{it.quantity}</div>
                  <div className="font-semibold">{fmtMoney(order.currency || 'EUR', it.unitPriceAmount)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {pickerOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-3">{t('Choose seller to message') || 'Choose seller to message'}</h3>
            <div className="space-y-2">
              {Array.from(new Set(items.map((it) => it.storeId).filter((v) => v != null))).map((sid) => (
                <button key={`s-${sid}`} className="btn btn-outline w-full" onClick={async () => {
                  setMessaging(true);
                  try {
                    const res = await createThread({ orderId: Number(id), storeId: sid });
                    const th = res?.data || res || {};
                    if (th?.id) navigate(`/account/messages?threadId=${th.id}`);
                  } catch (e) { errorHandler(e, t('Failed to start thread') || 'Failed to start thread'); }
                  finally { setMessaging(false); setPickerOpen(false); }
                }}>{(t('Store') || 'Store')} #{sid}</button>
              ))}
              {Array.from(new Set(items.map((it) => it.listingId).filter((v) => v != null))).map((lid) => (
                <button key={`l-${lid}`} className="btn btn-outline w-full" onClick={async () => {
                  setMessaging(true);
                  try {
                    const res = await createThread({ orderId: Number(id), listingId: lid });
                    const th = res?.data || res || {};
                    if (th?.id) navigate(`/account/messages?threadId=${th.id}`);
                  } catch (e) { errorHandler(e, t('Failed to start thread') || 'Failed to start thread'); }
                  finally { setMessaging(false); setPickerOpen(false); }
                }}>{(t('Listing') || 'Listing')} #{lid}</button>
              ))}
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setPickerOpen(false)}>{t('Close') || 'Close'}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

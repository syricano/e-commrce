import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { listMyOrders } from "@/services";
import { errorHandler } from "@/utils";
import { useLang } from "@/context/LangProvider";

export default function MyOrders() {
  const { t } = useLang();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fmtMoney = (currency, amount) => {
    const val = Number(amount || 0);
    try { 
      return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(val); 
    } catch { 
      return `${val.toFixed(2)} ${currency}`; 
    }
  };

  const mapConfirm = (s) => {
    const v = String(s || '').toLowerCase();
    if (v === 'fulfilled') return 'confirmed';
    if (v === 'unfulfilled') return 'pending';
    return v || 'pending';
  };

  useEffect(() => {
    let alive = true;

    listMyOrders({})
      .then((res) => {
        if (!alive) return;
        const orders = res?.data?.items || res?.items || [];
        setItems(orders);
      })
      .catch((e) => errorHandler(e, t("Failed to load orders") || "Failed to load orders"))
      .finally(() => alive && setLoading(false));

    return () => { alive = false; };
  }, []);

  return (
    <section className="p-4 space-y-3">
      <h1 className="text-xl font-semibold">{t('My Orders') || 'My Orders'}</h1>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>{t('ID') || 'ID'}</th>
              <th>{t('Status') || 'Status'}</th>
              <th>{t('Payment') || 'Payment'}</th>
              <th>{t('Confirmed') || 'Confirmed'}</th>
              <th>{t('Tracking') || 'Tracking'}</th>
              <th>{t('Total') || 'Total'}</th>
              <th>{t('Placed') || 'Placed'}</th>
            </tr>
          </thead>
          <tbody>
            {items.map(o => (
              <tr key={o.id}>
                <td>
                  <Link className="link" to={`/account/orders/${o.id}`}>{o.id}</Link>
                </td>
                <td>{`${o.paymentStatus || 'unpaid'}/${mapConfirm(o.fulfillmentStatus)}`}</td>
                <td>{o.paymentStatus || '—'}</td>
                <td>{mapConfirm(o.fulfillmentStatus) || '—'}</td>
                <td>{o.trackingNumber || '—'}</td>
                <td>{fmtMoney(o.currency || 'EUR', o.grandTotalAmount)}</td>
                <td>{o.placedAt ? new Date(o.placedAt).toLocaleString() : (o.createdAt ? new Date(o.createdAt).toLocaleString() : '—')}</td>
              </tr>
            ))}
            {!items.length && !loading && (
              <tr>
                <td colSpan={7} className="text-center opacity-60 py-6">
                  {t('No orders') || 'No orders'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

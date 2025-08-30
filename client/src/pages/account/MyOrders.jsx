// client/src/pages/account/MyOrders.jsx
import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { listMyOrders } from "@/services";
import { errorHandler } from "@/utils";
import { useLang } from "@/context/LangProvider";

export default function MyOrders() {
  const { t } = useLang();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listMyOrders({})
      .then((res) => setItems(res?.data?.items || res?.items || []))
      .catch((e) => errorHandler(e, t("Failed to load orders") || "Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="p-4 space-y-3">
      <h1 className="text-xl font-semibold">{t('My Orders') || 'My Orders'}</h1>
      <div className="overflow-x-auto">
        <table className="table">
          <thead><tr><th>{t('ID') || 'ID'}</th><th>{t('Status') || 'Status'}</th><th>{t('Total') || 'Total'}</th><th>{t('Created') || 'Created'}</th></tr></thead>
          <tbody>
            {items.map(o=>(
              <tr key={o.id}>
                <td><Link className="link" to={`/account/orders/${o.id}`}>{o.id}</Link></td>
                <td>{o.status}</td>
                <td>{o.total ?? o.amount ?? "—"}</td>
                <td>{o.createdAt ? new Date(o.createdAt).toLocaleString() : "—"}</td>
              </tr>
            ))}
            {!items.length && !loading && (
              <tr><td colSpan={4} className="text-center opacity-60 py-6">{t('No orders') || 'No orders'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

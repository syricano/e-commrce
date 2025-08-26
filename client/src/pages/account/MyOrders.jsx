// client/src/pages/account/MyOrders.jsx
import { useEffect, useState } from "react";
import { listMyOrders } from "@/services";
import { errorHandler } from "@/utils";

export default function MyOrders() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listMyOrders({})
      .then((res) => setItems(res?.data?.items || res?.items || []))
      .catch((e) => errorHandler(e, "Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="p-4 space-y-3">
      <h1 className="text-xl font-semibold">My Orders</h1>
      <div className="overflow-x-auto">
        <table className="table">
          <thead><tr><th>ID</th><th>Status</th><th>Total</th><th>Created</th></tr></thead>
          <tbody>
            {items.map(o=>(
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.status}</td>
                <td>{o.total ?? o.amount ?? "—"}</td>
                <td>{o.createdAt ? new Date(o.createdAt).toLocaleString() : "—"}</td>
              </tr>
            ))}
            {!items.length && !loading && (
              <tr><td colSpan={4} className="text-center opacity-60 py-6">No orders</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

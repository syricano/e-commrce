import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMyOrder } from '@/services';
import { errorHandler } from '@/utils';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getMyOrder(id)
      .then((res) => setOrder(res?.data || res || null))
      .catch((e) => errorHandler(e, 'Failed to load order'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <section className="p-4">Loading…</section>;
  if (!order) return <section className="p-4">Not found</section>;

  return (
    <section className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Order #{order.id}</h1>
        <Link to="/account/orders" className="btn btn-sm">Back to orders</Link>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card bg-base-200">
          <div className="card-body">
            <div><span className="opacity-60">Status:</span> {order.paymentStatus || order.status || '—'}</div>
            <div><span className="opacity-60">Fulfillment:</span> {order.fulfillmentStatus || '—'}</div>
            <div><span className="opacity-60">Currency:</span> {order.currency || '—'}</div>
            <div><span className="opacity-60">Total:</span> {order.grandTotalAmount ?? order.total ?? '—'}</div>
            <div><span className="opacity-60">Placed:</span> {order.placedAt ? new Date(order.placedAt).toLocaleString() : '—'}</div>
          </div>
        </div>
        <div className="card bg-base-200">
          <div className="card-body">
            <div className="font-semibold mb-2">Summary</div>
            <div>Items subtotal: {order.itemsSubtotalAmount ?? '—'}</div>
            <div>Shipping: {order.shippingAmount ?? '—'}</div>
            <div>Tax: {order.taxAmount ?? '—'}</div>
            <div>Discount: {order.discountAmount ?? 0}</div>
          </div>
        </div>
      </div>

      {/* Placeholder for items (if server returns them later) */}
      <div className="card bg-base-200">
        <div className="card-body">
          <div className="font-semibold">Items</div>
          <div className="opacity-60 text-sm">No line items to display.</div>
        </div>
      </div>
    </section>
  );
}


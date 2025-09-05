import { useEffect, useMemo, useState } from 'react';
import axiosInstance from '@/config/axiosConfig';
import { errorHandler } from '@/utils';
import { useLang } from '@/context/LangProvider';

const fmtMoney = (currency, amount) => {
  // Treat incoming value as major units (per user feedback)
  const val = Number(amount || 0);
  try { return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(val); }
  catch { return `${val.toFixed(2)} ${currency}`; }
};

export default function ManageOrders() {
  const { t } = useLang();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [editing, setEditing] = useState(null); // order row being edited
  const [shipmentsByOrder, setShipmentsByOrder] = useState({});
  const [itemsByOrder, setItemsByOrder] = useState({});

  const load = async (p = page) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/orders', { params: { page: p, limit: 20 } });
      const data = res?.data || {};
      setOrders(data.items || []);
      setTotal(data.total || 0);
      setPage(p);
    } catch (e) { errorHandler(e, t('Failed to load orders') || 'Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(1); }, []);

  const onEdit = (o) => setEditing({ ...o });
  const onCancel = () => setEditing(null);
  const onSave = async () => {
    try {
      const payload = {
        paymentStatus: editing.paymentStatus,
        fulfillmentStatus: editing.fulfillmentStatus,
      };
      await axiosInstance.put(`/orders/${editing.id}`, payload);
      setEditing(null);
      await load(page);
    } catch (e) { errorHandler(e, t('Failed to update order') || 'Failed to update order'); }
  };

  const loadShipments = async (orderId) => {
    try {
      const res = await axiosInstance.get('/shipments', { params: { orderId } });
      setShipmentsByOrder((s) => ({ ...s, [orderId]: (res?.data?.items || res?.data || []) }));
    } catch {}
  };
  const loadItems = async (orderId) => {
    try {
      const res = await axiosInstance.get('/order-items', { params: { orderId } });
      setItemsByOrder((s) => ({ ...s, [orderId]: (res?.data?.items || res?.data || []) }));
    } catch {}
  };

  const addShipment = async (orderId, payload) => {
    try {
      await axiosInstance.post('/shipments', { orderId, ...payload });
      await loadShipments(orderId);
    } catch (e) { errorHandler(e, t('Failed to add shipment') || 'Failed to add shipment'); }
  };

  const pages = Math.ceil(total / 20);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('Manage Orders') || 'Manage Orders'}</h1>
        <div className="flex items-center gap-2">
          <button className="btn btn-sm" onClick={()=>load(page)} disabled={loading}>{t('Refresh') || 'Refresh'}</button>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>ID</th>
              <th>Number</th>
              <th>Status</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Confirmed</th>
              <th>Placed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="align-top">
                <td>{o.id}</td>
                <td>{o.number}</td>
                <td><span className="badge">{`${(o.paymentStatus||'unpaid')}/${o.fulfillmentStatus||'unfulfilled'}`}</span></td>
                <td>{fmtMoney(o.currency || 'EUR', o.grandTotalAmount)}</td>
                <td>
                  {editing?.id === o.id ? (
                    <select className="select select-bordered select-sm" value={editing.paymentStatus} onChange={(e)=>setEditing((s)=>({ ...s, paymentStatus: e.target.value }))}>
                      {['unpaid','paid','refunded','partial_refund'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : (
                    <span>{o.paymentStatus}</span>
                  )}
                </td>
                <td>
                  {editing?.id === o.id ? (
                    <select className="select select-bordered select-sm" value={editing.fulfillmentStatus} onChange={(e)=>setEditing((s)=>({ ...s, fulfillmentStatus: e.target.value }))}>
                      {['unfulfilled','partial','fulfilled','cancelled'].map(s => <option key={s} value={s}>{s==='fulfilled'?'confirmed':s}</option>)}
                    </select>
                  ) : (
                    <span>{o.fulfillmentStatus === 'fulfilled' ? 'confirmed' : o.fulfillmentStatus}</span>
                  )}
                </td>
                <td>{o.placedAt ? new Date(o.placedAt).toLocaleString() : '—'}</td>
                <td className="space-x-2">
                  {editing?.id === o.id ? (
                    <>
                      <button className="btn btn-xs" onClick={onCancel}>{t('cancel') || 'Cancel'}</button>
                      <button className="btn btn-primary btn-xs" onClick={onSave}>{t('save') || 'Save'}</button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-xs" onClick={()=>onEdit(o)}>{t('Edit') || 'Edit'}</button>
                      <button className="btn btn-xs" onClick={()=>{ loadShipments(o.id); loadItems(o.id); }}>
                        {t('Shipments') || 'Shipments'}
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Shipments inspector */}
      {orders.map((o) => (
        shipmentsByOrder[o.id] || itemsByOrder[o.id] ? (
          <div key={`ship-${o.id}`} className="card bg-base-100 border">
            <div className="card-body">
              <div className="font-semibold">{t('Order')} #{o.id} — {t('Shipments')}</div>
              <div className="opacity-70 text-sm">{t('Use storeId from items for seller shipments') || 'Use storeId from items for seller shipments'}</div>
              <div className="grid md:grid-cols-3 gap-2">
                <div className="md:col-span-2">
                  <div className="font-medium mb-1">{t('Existing Shipments') || 'Existing Shipments'}</div>
                  <ul className="text-sm list-disc pl-5">
                    {(shipmentsByOrder[o.id] || []).map(s => (
                      <li key={s.id}>
                        #{s.id} • store {s.storeId} • {s.carrier || '—'} {s.trackingNumber || ''} • {s.status}
                      </li>
                    ))}
                    {(shipmentsByOrder[o.id] || []).length === 0 && <li className="opacity-60">{t('No shipments') || 'No shipments'}</li>}
                  </ul>
                </div>
                <div>
                  <div className="font-medium mb-1">{t('Add Shipment') || 'Add Shipment'}</div>
                  <AddShipmentForm order={o} items={itemsByOrder[o.id] || []} onAdd={(payload)=>addShipment(o.id, payload)} />
                </div>
              </div>
            </div>
          </div>
        ) : null
      ))}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center gap-2 justify-end">
          <button className="btn btn-sm" disabled={page<=1} onClick={()=>load(page-1)}>‹</button>
          <span className="text-sm">{page} / {pages}</span>
          <button className="btn btn-sm" disabled={page>=pages} onClick={()=>load(page+1)}>›</button>
        </div>
      )}
    </section>
  );
}

function AddShipmentForm({ order, items, onAdd }) {
  const [storeId, setStoreId] = useState(items[0]?.storeId || '');
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [status, setStatus] = useState('pending');
  const [busy, setBusy] = useState(false);

  const uniqueStores = Array.from(new Set((items || []).map(i => i.storeId))).filter(Boolean);

  const submit = async () => {
    setBusy(true);
    try {
      const payload = { storeId: Number(storeId), carrier: carrier || undefined, trackingNumber: trackingNumber || undefined, status };
      await onAdd(payload);
      setCarrier(''); setTrackingNumber('');
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-2">
      <label className="form-control">
        <span className="label-text">storeId</span>
        <select className="select select-bordered" value={storeId} onChange={(e)=>setStoreId(e.target.value)}>
          <option value="">—</option>
          {uniqueStores.map(id => <option key={id} value={id}>{id}</option>)}
        </select>
      </label>
      <label className="form-control">
        <span className="label-text">Carrier</span>
        <input className="input input-bordered" value={carrier} onChange={(e)=>setCarrier(e.target.value)} />
      </label>
      <label className="form-control">
        <span className="label-text">Tracking</span>
        <input className="input input-bordered" value={trackingNumber} onChange={(e)=>setTrackingNumber(e.target.value)} />
      </label>
      <label className="form-control">
        <span className="label-text">Status</span>
        <select className="select select-bordered" value={status} onChange={(e)=>setStatus(e.target.value)}>
          {['pending','shipped','delivered','lost','returned'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>
      <button className="btn btn-primary btn-sm" onClick={submit} disabled={busy || !storeId}>{busy ? '…' : 'Add'}</button>
    </div>
  );
}

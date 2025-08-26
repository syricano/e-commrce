import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllListings, deleteListing } from '@/services';
import { useAuth } from '@/context';
import { errorHandler } from '@/utils';
import { toast } from 'react-hot-toast';

const pickTitle = (l, locale = 'en') =>
  l?.translations?.find(t => t.locale === locale)?.title
  || l?.translations?.[0]?.title
  || l?.title
  || '—';

const formatPrice = (amount, currency) => {
  if (amount == null) return '—';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency || ''}`.trim();
  }
};

export default function MyListings() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      // Ask server for mine; also client-filter as fallback.
      const res = await getAllListings({ mine: 1, limit: 100 });
      const rows = res?.items || res?.data?.items || res || [];
      setItems(
        Array.isArray(rows)
          ? rows.filter(l => !user?.id || l.ownerId === user.id || l.userId === user.id)
          : []
      );
    } catch (e) {
      errorHandler(e, 'Failed to load your listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.id]);

  const onDelete = async (l) => {
    if (!confirm(`Delete listing #${l.id}? This cannot be undone.`)) return;
    try {
      await deleteListing(l.id);
      toast.success('Listing deleted');
      setItems((s) => s.filter(x => x.id !== l.id));
    } catch (e) {
      errorHandler(e, 'Delete failed');
    }
  };

  const table = useMemo(() => (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Price</th>
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(l => (
            <tr key={l.id}>
              <td>{l.id}</td>
              <td className="whitespace-nowrap">{pickTitle(l)}</td>
              <td className="whitespace-nowrap">{formatPrice(l.priceAmount, l.priceCurrency)}</td>
              <td className="whitespace-nowrap">{l.status || 'active'}</td>
              <td className="text-right space-x-2">
                {/* Wire up edit page if you add it later */}
                {/* <button className="btn btn-xs" onClick={()=>nav(`/account/my-listings/${l.id}/edit`)}>Edit</button> */}
                <button className="btn btn-error btn-xs" onClick={() => onDelete(l)}>Delete</button>
              </td>
            </tr>
          ))}
          {items.length === 0 && !loading && (
            <tr><td colSpan={5} className="text-center opacity-60 py-6">No listings</td></tr>
          )}
        </tbody>
      </table>
    </div>
  ), [items, loading]);

  return (
    <section className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Listings</h1>
        <button className="btn btn-primary btn-sm" onClick={()=>nav('/account/my-listings/new')}>Create</button>
      </div>
      {loading ? <div>Loading…</div> : table}
    </section>
  );
}

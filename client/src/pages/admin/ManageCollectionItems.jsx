import { useEffect, useMemo, useState } from 'react';
import axiosInstance from '@/config/axiosConfig';
import { errorHandler } from '@/utils';
import usePageTitle from '@/hooks/usePageTitle';
import { useLang } from '@/context/LangProvider';

const KIND_OPTIONS = [
  { value: 'storeOffer', label: 'Store Offer' },
  { value: 'product',    label: 'Product' },
  { value: 'listing',    label: 'Listing' },
];

export default function ManageCollectionItems() {
  usePageTitle('ManageCollectionItems');
  const { t, lang } = useLang();

  const [collections, setCollections] = useState([]);
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ collectionId: '', kind: '' });
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    collectionId: '',
    kind: 'storeOffer',
    refId: '',
    rank: 0,
    pinned: false,
    isActive: true,
  });

  const loadCollections = async () => {
    try {
      const res = await axiosInstance.get('/collections', { params: { limit: 1000 } });
      const arr = res?.data?.items || res?.data || [];
      setCollections(arr);
    } catch (e) {
      errorHandler(e, t('Failed to load') || 'Failed to load');
    }
  };

  const loadItems = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.collectionId) params.collectionId = filters.collectionId;
      if (filters.kind) params.kind = filters.kind;
      const res = await axiosInstance.get('/collection-items', { params });
      const list = res?.data?.items || res?.data || [];
      setItems(list);
    } catch (e) {
      errorHandler(e, t('Failed to load') || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  useEffect(() => {
    loadItems();
  }, [filters.collectionId, filters.kind]);

  const colnOptions = useMemo(() => {
    return (collections || []).map(c => ({ value: c.id, label: c.key }));
  }, [collections]);

  const submit = async () => {
    const payload = {
      collectionId: form.collectionId ? Number(form.collectionId) : null,
      kind: form.kind,
      refId: form.refId ? Number(form.refId) : null,
      rank: Number.isFinite(Number(form.rank)) ? Number(form.rank) : 0,
      pinned: !!form.pinned,
      isActive: !!form.isActive,
    };
    if (!payload.collectionId || !payload.refId) return;

    try {
      await axiosInstance.post('/collection-items', payload);
      setForm({ collectionId: '', kind: 'storeOffer', refId: '', rank: 0, pinned: false, isActive: true });
      // keep current filter; reload
      await loadItems();
    } catch (e) {
      errorHandler(e, t('Create failed') || 'Create failed');
    }
  };

  const remove = async (id) => {
    try {
      await axiosInstance.delete(`/collection-items/${id}`);
      await loadItems();
    } catch (e) {
      errorHandler(e, t('Delete failed') || 'Delete failed');
    }
  };

  const toggle = async (row, key) => {
    try {
      await axiosInstance.put(`/collection-items/${row.id}`, { [key]: !row[key] });
      await loadItems();
    } catch (e) {
      errorHandler(e, t('Update failed') || 'Update failed');
    }
  };

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">{t('ManageCollectionItems') || 'Manage Collection Items'}</h1>

      {/* Filters */}
      <div className="card bg-base-100 border">
        <div className="card-body grid gap-3 md:grid-cols-3">
          <label className="form-control">
            <span className="label-text">{t('Collection') || 'Collection'}</span>
            <select
              className="select select-bordered"
              value={filters.collectionId}
              onChange={(e) => setFilters(s => ({ ...s, collectionId: e.target.value }))}
            >
              <option value="">{t('All') || 'All'}</option>
              {colnOptions.map(o => <option key={`f-${o.value}`} value={o.value}>{o.label}</option>)}
            </select>
          </label>

          <label className="form-control">
            <span className="label-text">{t('Kind') || 'Kind'}</span>
            <select
              className="select select-bordered"
              value={filters.kind}
              onChange={(e) => setFilters(s => ({ ...s, kind: e.target.value }))}
            >
              <option value="">{t('All') || 'All'}</option>
              {KIND_OPTIONS.map(o => <option key={`fk-${o.value}`} value={o.value}>{o.label}</option>)}
            </select>
          </label>
        </div>
      </div>

      {/* Create */}
      <div className="card bg-base-100 border">
        <div className="card-body grid gap-3 md:grid-cols-3">
          <label className="form-control">
            <span className="label-text">{t('Collection') || 'Collection'}</span>
            <select
              className="select select-bordered"
              value={form.collectionId}
              onChange={(e) => setForm(s => ({ ...s, collectionId: e.target.value }))}
            >
              <option value="">{t('Select') || 'Select'}</option>
              {colnOptions.map(o => <option key={`c-${o.value}`} value={o.value}>{o.label}</option>)}
            </select>
          </label>

          <label className="form-control">
            <span className="label-text">{t('Kind') || 'Kind'}</span>
            <select
              className="select select-bordered"
              value={form.kind}
              onChange={(e) => setForm(s => ({ ...s, kind: e.target.value }))}
            >
              {KIND_OPTIONS.map(o => <option key={`k-${o.value}`} value={o.value}>{o.label}</option>)}
            </select>
          </label>

          <label className="form-control">
            <span className="label-text">{t('RefId') || 'Ref ID'}</span>
            <input
              className="input input-bordered"
              type="number"
              min="1"
              value={form.refId}
              onChange={(e) => setForm(s => ({ ...s, refId: e.target.value }))}
            />
          </label>

          <label className="form-control">
            <span className="label-text">{t('Rank') || 'Rank'}</span>
            <input
              className="input input-bordered"
              type="number"
              value={form.rank}
              onChange={(e) => setForm(s => ({ ...s, rank: e.target.value }))}
            />
          </label>

          <label className="form-control">
            <span className="label-text">{t('Pinned') || 'Pinned'}</span>
            <input
              type="checkbox"
              className="toggle"
              checked={!!form.pinned}
              onChange={(e) => setForm(s => ({ ...s, pinned: e.target.checked }))}
            />
          </label>

          <label className="form-control">
            <span className="label-text">{t('Active') || 'Active'}</span>
            <input
              type="checkbox"
              className="toggle"
              checked={!!form.isActive}
              onChange={(e) => setForm(s => ({ ...s, isActive: e.target.checked }))}
            />
          </label>

          <div className="md:col-span-3 text-right">
            <button className="btn btn-primary" onClick={submit}>
              {t('Add') || 'Add'}
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="card bg-base-100 border">
        <div className="card-body">
          {loading && <div className="opacity-60">{t('Loading…') || 'Loading…'}</div>}
          {!loading && items.length === 0 && <div className="opacity-60">{t('No items') || 'No items'}</div>}
          {!loading && items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>{t('Collection') || 'Collection'}</th>
                    <th>{t('Kind') || 'Kind'}</th>
                    <th>{t('RefId') || 'Ref ID'}</th>
                    <th>{t('Rank') || 'Rank'}</th>
                    <th>{t('Pinned') || 'Pinned'}</th>
                    <th>{t('Active') || 'Active'}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row) => {
                    const coln = collections.find(c => Number(c.id) === Number(row.collectionId));
                    return (
                      <tr key={row.id}>
                        <td>{row.id}</td>
                        <td>{coln?.key || row.collectionId}</td>
                        <td>{row.kind}</td>
                        <td>{row.refId}</td>
                        <td>{row.rank}</td>
                        <td>
                          <input
                            type="checkbox"
                            className="toggle toggle-sm"
                            checked={!!row.pinned}
                            onChange={() => toggle(row, 'pinned')}
                          />
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            className="toggle toggle-sm"
                            checked={!!row.isActive}
                            onChange={() => toggle(row, 'isActive')}
                          />
                        </td>
                        <td className="text-right">
                          <button className="btn btn-ghost btn-xs" onClick={() => remove(row.id)}>
                            {t('Delete') || 'Delete'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

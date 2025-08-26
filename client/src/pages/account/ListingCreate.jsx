import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createListing } from '@/services';
import axiosInstance from '@/config/axiosConfig';
import { useAuth } from '@/context';
import { errorHandler } from '@/utils';
import { toast } from 'react-hot-toast';

const CONDITIONS = ['new','used','refurbished'];
const STATUSES   = ['draft','active','reserved','sold','expired'];

// Keep this list short if you like. Server accepts any ISO 4217 code.
const CURRENCIES = [
  'EUR','USD','GBP','JPY','CNY','INR','CAD','AUD','CHF','SEK','NOK','DKK','PLN','TRY',
  'AED','SAR','QAR','KWD','BHD','OMR','EGP','MAD','ZAR','NGN','KES','BRL','MXN','ARS',
  'CLP','COP','PEN','HKD','TWD','KRW','SGD','NZD','CZK','HUF','RON','UAH','PKR','BDT',
];

export default function ListingCreate() {
  const nav = useNavigate();
  const { user } = useAuth();

  const [cats, setCats] = useState([]);
  const [busy, setBusy] = useState(false);

  const [f, setF] = useState({
    ownerUserId: user?.id ?? undefined,
    categoryId: '',
    priceAmount: '',
    currency: 'EUR',
    negotiable: false,
    condition: 'used',
    status: 'draft',
    locationCity: '',
    locationLat: '',
    locationLng: '',
    views: 0,
    favoritesCount: 0,
    publishedAt: '',
    expiresAt: '',
    metadata: '{ }',
  });

  useEffect(() => {
    setF(s => ({ ...s, ownerUserId: user?.id ?? undefined }));
  }, [user?.id]);

  useEffect(() => {
    // load categories for select
    axiosInstance.get('/categories', { params: { limit: 200 } })
      .then(res => setCats(res?.data?.items || res?.data || []))
      .catch(e => errorHandler(e, 'Failed to load categories'));
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setF(s => ({ ...s, [name]: type === 'checkbox' ? checked : value }));
  };

  const parseMaybe = (v, fn) => (v === '' || v == null ? null : fn(v));
  const parseJSON = (txt) => {
    try { return txt && txt.trim() ? JSON.parse(txt) : null; } catch { return null; }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const body = {
        ownerUserId: user?.id, // authoritative
        categoryId: parseMaybe(f.categoryId, (x)=>Number(x)),
        priceAmount: parseMaybe(f.priceAmount, (x)=>Number(x)),
        currency: (f.currency || 'EUR').toUpperCase(),
        negotiable: !!f.negotiable,
        condition: f.condition,
        status: f.status,
        locationCity: f.locationCity || null,
        locationLat: parseMaybe(f.locationLat, (x)=>Number(x)),
        locationLng: parseMaybe(f.locationLng, (x)=>Number(x)),
        views: parseMaybe(f.views, (x)=>Number(x)) ?? 0,
        favoritesCount: parseMaybe(f.favoritesCount, (x)=>Number(x)) ?? 0,
        publishedAt: f.publishedAt ? new Date(f.publishedAt) : null,
        expiresAt:   f.expiresAt   ? new Date(f.expiresAt)   : null,
        metadata: parseJSON(f.metadata),
        // If your API still expects translations, add them here.
        // translations: [{ locale: 'en', title: f.title || '', description: f.description || '' }]
      };

      await createListing(body);
      toast.success('Listing created');
      nav('/account/listings');
    } catch (err) {
      errorHandler(err, 'Create listing failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Listing</h1>

      <form className="grid gap-3" onSubmit={onSubmit}>
        <div className="grid md:grid-cols-2 gap-3">
          <label className="form-control">
            <span className="label-text">Owner</span>
            <input className="input input-bordered" value={user?.id || ''} readOnly />
          </label>

          <label className="form-control">
            <span className="label-text">Category</span>
            <select name="categoryId" className="select select-bordered" value={f.categoryId} onChange={onChange}>
              <option value="">— none —</option>
              {cats.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name || c.slug || c.id}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <label className="form-control">
            <span className="label-text">Price amount</span>
            <input name="priceAmount" type="number" className="input input-bordered" value={f.priceAmount} onChange={onChange} required />
          </label>

          <label className="form-control">
            <span className="label-text">Currency</span>
            <select name="currency" className="select select-bordered" value={f.currency} onChange={onChange}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>

          <label className="form-control">
            <span className="label-text">Negotiable</span>
            <input name="negotiable" type="checkbox" className="toggle" checked={f.negotiable} onChange={onChange} />
          </label>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <label className="form-control">
            <span className="label-text">Condition</span>
            <select name="condition" className="select select-bordered" value={f.condition} onChange={onChange}>
              {CONDITIONS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </label>

          <label className="form-control">
            <span className="label-text">Status</span>
            <select name="status" className="select select-bordered" value={f.status} onChange={onChange}>
              {STATUSES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </label>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <label className="form-control">
            <span className="label-text">City</span>
            <input name="locationCity" className="input input-bordered" value={f.locationCity} onChange={onChange} />
          </label>

          <label className="form-control">
            <span className="label-text">Latitude</span>
            <input name="locationLat" type="number" step="0.000001" className="input input-bordered" value={f.locationLat} onChange={onChange} />
          </label>

          <label className="form-control">
            <span className="label-text">Longitude</span>
            <input name="locationLng" type="number" step="0.000001" className="input input-bordered" value={f.locationLng} onChange={onChange} />
          </label>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <label className="form-control">
            <span className="label-text">Published at</span>
            <input name="publishedAt" type="datetime-local" className="input input-bordered" value={f.publishedAt} onChange={onChange} />
          </label>

          <label className="form-control">
            <span className="label-text">Expires at</span>
            <input name="expiresAt" type="datetime-local" className="input input-bordered" value={f.expiresAt} onChange={onChange} />
          </label>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <label className="form-control">
            <span className="label-text">Views</span>
            <input name="views" type="number" className="input input-bordered" value={f.views} onChange={onChange} />
          </label>

          <label className="form-control">
            <span className="label-text">Favorites count</span>
            <input name="favoritesCount" type="number" className="input input-bordered" value={f.favoritesCount} onChange={onChange} />
          </label>
        </div>

        <label className="form-control">
          <span className="label-text">Metadata (JSON)</span>
          <textarea
            name="metadata"
            className="textarea textarea-bordered font-mono"
            rows={4}
            value={f.metadata}
            onChange={onChange}
            placeholder='{"color":"black","warranty":true}'
          />
        </label>

        <div className="card-actions justify-end mt-2">
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving…' : 'Create'}
          </button>
        </div>
      </form>
    </section>
  );
}

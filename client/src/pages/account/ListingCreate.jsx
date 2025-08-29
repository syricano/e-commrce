import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/config/axiosConfig';
import { useAuth } from '@/context';
import { useLang } from '@/context/LangProvider';
import { errorHandler } from '@/utils';
import { toast } from 'react-hot-toast';
import { COUNTRIES, CITIES_BY_COUNTRY } from '@/services/geo';
import usePageTitle from '@/hooks/usePageTitle';

const CURRENCIES = ['EUR','USD','GBP','AED','SAR'];
const CONDITIONS = ['new','used','refurbished'];

const slugify = (s) => {
  const base = (s || '').toString().trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return base || `listing-${Date.now()}`;
};

export default function ListingCreate() {
  const nav = useNavigate();
  const { user } = useAuth(); // kept if you need auth-guard
  const { lang, t } = useLang();
  usePageTitle('sell');

  const [cats, setCats] = useState([]);
  const [catTrs, setCatTrs] = useState([]);
  const [busy, setBusy] = useState(false);
  const [attrs, setAttrs] = useState({});

  const [f, setF] = useState({
    categoryId: '',
    title: '',
    description: '',
    priceAmount: '',
    currency: 'EUR',
    negotiable: false,
    allowCheckout: false,
    condition: 'used',
    country: COUNTRIES[0],
    city: '',
    setCoords: false,
    locationLat: '',
    locationLng: '',
    expiryMode: 'never',
    expiresAt: '',
  });

  useEffect(() => {
    const run = async () => {
      try {
        const [cRes, tRes] = await Promise.all([
          axiosInstance.get('/categories', { params: { limit: 500 } }),
          axiosInstance.get('/category-translations', { params: { limit: 2000 } }).catch(() => ({ data: [] })),
        ]);
        setCats(cRes?.data?.items || cRes?.data || []);
        const trs = tRes?.data?.items || tRes?.data || [];
        setCatTrs(Array.isArray(trs) ? trs : []);
      } catch (e) {
        errorHandler(e, 'Failed to load categories');
      }
    };
    run();
  }, []);

  const catNameById = useMemo(() => {
    const byId = new Map();
    for (const t of catTrs) {
      if (t?.categoryId && t?.locale === lang && t?.name) byId.set(Number(t.categoryId), t.name);
    }
    for (const t of catTrs) {
      const id = Number(t?.categoryId);
      if (id && !byId.has(id) && t?.name) byId.set(id, t.name);
    }
    return byId;
  }, [catTrs, lang]);

  const pickCatLabel = (c) =>
    catNameById.get(Number(c?.id)) || c?.name || c?.slug || `#${c?.id}`;

  const cities = useMemo(() => CITIES_BY_COUNTRY[f.country] || [], [f.country]);
  const selectedCat = useMemo(() => cats.find(c => String(c.id) === String(f.categoryId)) || null, [cats, f.categoryId]);
  const filterFields = useMemo(() => selectedCat?.metadata?.filters?.fields || [], [selectedCat]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setF(s => ({ ...s, [name]: type === 'checkbox' ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const title = f.title.trim();
    if (!title) return toast.error('Title is required');
    if (f.priceAmount === '' || Number.isNaN(Number(f.priceAmount))) {
      return toast.error('Valid price is required');
    }

    const body = {
      priceAmount: Number(f.priceAmount),
      currency: (f.currency || 'EUR').toUpperCase(),
      negotiable: !!f.negotiable,
      allowCheckout: !!f.allowCheckout,
      condition: f.condition,
      status: 'active', // force active on create
      translations: [
        {
          locale: lang || 'en',
          title,
          slug: slugify(title),
          description: (f.description || '').trim(),
        },
      ],
    };

    if (f.categoryId) body.categoryId = Number(f.categoryId);
    if (f.city)       body.locationCity = f.city;

    if (f.setCoords) {
      const lat = Number(f.locationLat);
      const lng = Number(f.locationLng);
      if (!Number.isNaN(lat)) body.locationLat = lat;
      if (!Number.isNaN(lng)) body.locationLng = lng;
    }

    if (f.expiryMode === 'date' && f.expiresAt) {
      body.expiresAt = new Date(f.expiresAt).toISOString();
    }

    // Attach category-specific attributes into metadata
    if (filterFields.length) {
      body.metadata = { ...(body.metadata || {}), ...attrs };
    }

    setBusy(true);
    try {
      await axiosInstance.post('/listings', body);
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
      <h1 className="text-2xl font-bold mb-4">{t('Create Listing') || 'Create Listing'}</h1>

      <form className="grid gap-4" onSubmit={onSubmit}>
        <div className="grid gap-3">
          <label className="form-control">
            <span className="label-text">Title</span>
            <input
              name="title"
              className="input input-bordered"
              value={f.title}
              onChange={onChange}
              placeholder="e.g. iPhone 12 128GB"
              required
            />
          </label>

          <label className="form-control">
            <span className="label-text">Description</span>
            <textarea
              name="description"
              className="textarea textarea-bordered"
              rows={4}
              value={f.description}
              onChange={onChange}
              placeholder="Condition, what’s included, pickup/shipping details…"
            />
          </label>
        </div>

        

        <div className="grid md:grid-cols-3 gap-3">
          <label className="form-control">
            <span className="label-text">Category</span>
            <select
              name="categoryId"
              className="select select-bordered"
              value={f.categoryId}
              onChange={onChange}
            >
              <option value="">— none —</option>
              {cats
                .slice()
                .sort((a,b) => pickCatLabel(a).localeCompare(pickCatLabel(b)))
                .map(c => (
                  <option key={c.id} value={c.id}>
                    {pickCatLabel(c)}
                  </option>
                ))}
            </select>
          </label>

          <label className="form-control">
            <span className="label-text">Price</span>
            <input
              name="priceAmount"
              type="number"
              className="input input-bordered"
              value={f.priceAmount}
              onChange={onChange}
              required
              min="0"
            />
          </label>

          <label className="form-control">
            <span className="label-text">Currency</span>
            <select
              name="currency"
              className="select select-bordered"
              value={f.currency}
              onChange={onChange}
            >
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>

        {/* Category-specific attributes (after selecting category) */}
        {filterFields.length > 0 && (
          <div className="grid md:grid-cols-2 gap-3">
            {filterFields.map(field => (
              <label key={field.key} className="form-control">
                <span className="label-text">{field.label || field.key}</span>
                {field.type === 'select' ? (
                  <select
                    className="select select-bordered"
                    value={attrs[field.key] || ''}
                    onChange={(e)=>setAttrs(s=>({ ...s, [field.key]: e.target.value }))}
                  >
                    <option value="">—</option>
                    {(field.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input
                    className="input input-bordered"
                    type={field.type==='number'?'number':'text'}
                    value={attrs[field.key] || ''}
                    onChange={(e)=>setAttrs(s=>({ ...s, [field.key]: e.target.value }))}
                  />
                )}
              </label>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-3">
          <label className="form-control">
            <span className="label-text">Condition</span>
            <select
              name="condition"
              className="select select-bordered"
              value={f.condition}
              onChange={onChange}
            >
              {CONDITIONS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </label>

          <label className="form-control">
            <span className="label-text">Negotiable</span>
            <input
              name="negotiable"
              type="checkbox"
              className="toggle"
              checked={f.negotiable}
              onChange={onChange}
            />
          </label>

          <label className="form-control">
            <span className="label-text">Allow online checkout</span>
            <input
              name="allowCheckout"
              type="checkbox"
              className="toggle"
              checked={f.allowCheckout}
              onChange={onChange}
            />
          </label>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <label className="form-control">
            <span className="label-text">Country</span>
            <select
              name="country"
              className="select select-bordered"
              value={f.country}
              onChange={(e) => {
                const country = e.target.value;
                const list = CITIES_BY_COUNTRY[country] || [];
                setF(s => ({
                  ...s,
                  country,
                  city: list.includes(s.city) ? s.city : (list[0] || '')
                }));
              }}
            >
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>

          <label className="form-control">
            <span className="label-text">City</span>
            <select
              name="city"
              className="select select-bordered"
              value={f.city}
              onChange={onChange}
            >
              <option value="">— select —</option>
              {(CITIES_BY_COUNTRY[f.country] || []).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>

        <div className="grid gap-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="setCoords"
              className="checkbox"
              checked={f.setCoords}
              onChange={onChange}
            />
            <span className="label-text">Set map coordinates (optional)</span>
          </label>

          {f.setCoords && (
            <div className="grid md:grid-cols-2 gap-3">
              <label className="form-control">
                <span className="label-text">Latitude</span>
                <input
                  name="locationLat"
                  type="number"
                  step="0.000001"
                  className="input input-bordered"
                  value={f.locationLat}
                  onChange={onChange}
                  placeholder="e.g. 33.513"
                />
              </label>
              <label className="form-control">
                <span className="label-text">Longitude</span>
                <input
                  name="locationLng"
                  type="number"
                  step="0.000001"
                  className="input input-bordered"
                  value={f.locationLng}
                  onChange={onChange}
                  placeholder="e.g. 36.292"
                />
              </label>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <label className="form-control">
            <span className="label-text">Expiry</span>
            <div className="join">
              <button
                type="button"
                className={`btn join-item ${f.expiryMode === 'never' ? 'btn-active' : ''}`}
                onClick={() => setF(s => ({ ...s, expiryMode: 'never' }))}
              >
                Never
              </button>
              <button
                type="button"
                className={`btn join-item ${f.expiryMode === 'date' ? 'btn-active' : ''}`}
                onClick={() => setF(s => ({ ...s, expiryMode: 'date' }))}
              >
                Choose date
              </button>
            </div>
          </label>

          {f.expiryMode === 'date' && (
            <label className="form-control">
              <span className="label-text">Expires at</span>
              <input
                name="expiresAt"
                type="datetime-local"
                className="input input-bordered"
                value={f.expiresAt}
                onChange={onChange}
              />
            </label>
          )}
        </div>

        <div className="card-actions justify-end mt-2">
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving…' : 'Create'}
          </button>
        </div>
      </form>
    </section>
  );
}

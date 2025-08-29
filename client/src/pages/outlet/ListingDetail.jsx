import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/config/axiosConfig';
import usePageTitle from '@/hooks/usePageTitle';
import { useLang } from '@/context/LangProvider';
import { useAuth } from '@/context';
import { errorHandler } from '@/utils';
import { toast } from 'react-hot-toast';
import Spinner from '@/components/UI/Spinner.jsx';
import { toggleFavorite as apiToggleFavorite } from '@/services';

const pickTr = (row, lang) => {
  const trs = Array.isArray(row?.translations) ? row.translations : [];
  const by = {};
  for (const t of trs) if (t?.locale) by[t.locale] = t;
  return by[lang] || by.en || by.ar || trs[0] || null;
};

export default function ListingDetail() {
  const { id } = useParams();
  const { lang, t } = useLang();
  const { user, isAuthenticated } = useAuth();
  const nav = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [catName, setCatName] = useState('');
  const [offerOpen, setOfferOpen] = useState(false);
  const [fav, setFav] = useState(false);
  const [offer, setOffer] = useState({ amount: '', message: '' });

  usePageTitle('Listings');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/listings/${id}`);
        setItem(res?.data || res);
      } catch (e) {
        errorHandler(e, 'Failed to load listing');
      } finally { setLoading(false); }
    };
    if (id) load();
  }, [id]);

  const tr = useMemo(() => pickTr(item, lang), [item, lang]);
  const media = Array.isArray(item?.media) ? [...item.media].sort((a,b)=> (a.position||0)-(b.position||0)) : [];
  const isOwner = item && user && item.ownerUserId === user.id;

  useEffect(() => {
    const fetchCat = async () => {
      try {
        if (!item?.categoryId) return setCatName('');
        const res = await axiosInstance.get('/category-translations', { params: { categoryId: item.categoryId, limit: 10 } });
        const rows = res?.data?.items || res?.data || [];
        if (!Array.isArray(rows)) return setCatName('');
        const by = {};
        for (const r of rows) if (r?.locale) by[r.locale] = r;
        const best = by[lang] || by.en || by.ar || rows[0];
        setCatName(best?.name || '');
      } catch {}
    };
    fetchCat();
  }, [item?.categoryId, lang]);

  const onPrev = () => setCurrent((i) => (media.length ? (i - 1 + media.length) % media.length : 0));
  const onNext = () => setCurrent((i) => (media.length ? (i + 1) % media.length : 0));

  const onToggleFav = async () => {
    try {
      await apiToggleFavorite(item.id);
      setFav(v=>!v);
      toast.success(!fav ? 'Added to favorites' : 'Removed from favorites');
    } catch(e) { errorHandler(e, 'Failed to update favorite'); }
  };

  const onMessageSeller = async () => {
    if (!isAuthenticated) return nav('/signin');
    if (!item) return;
    if (isOwner) return toast.error('This is your listing');
    try {
      const res = await axiosInstance.post('/threads', { listingId: Number(item.id) });
      const thread = res?.data || res;
      const name = user?.firstName || user?.email || 'User';
      const template = lang==='ar'
        ? `مرحباً،\nأنا مهتم بهذا العرض.\nهل ما زال متاحاً؟\nشكراً،\n${name}`
        : `Hi,\nI'm interested in this offer.\nIs it still available?\nThanks,\n${name}`;
      const url = `/account/messages?threadId=${encodeURIComponent(thread?.id || '')}&prefill=${encodeURIComponent(template)}`;
      toast.success('Thread started');
      nav(url);
    } catch (e) { errorHandler(e, 'Failed to start chat'); }
  };

  const onSubmitOffer = async () => {
    if (!isAuthenticated) return nav('/signin');
    if (!item) return;
    const amountNum = Number(offer.amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) return toast.error('Enter a valid amount');
    try {
      await axiosInstance.post('/listing-offers', { listingId: item.id, amount: Math.round(amountNum), message: offer.message || undefined });
      toast.success('Offer sent');
      setOfferOpen(false);
      setOffer({ amount: '', message: '' });
    } catch (e) { errorHandler(e, 'Failed to send offer'); }
  };

  const onBuyNow = async () => {
    if (!isAuthenticated) return nav('/signin');
    if (!item) return;
    if (!item.allowCheckout) return toast.error('Checkout disabled for this listing');
    if (isOwner) return toast.error('This is your listing');
    if (item.status !== 'active') return toast.error('Listing not available');
    try {
      const res = await axiosInstance.post(`/listings/${item.id}/buy`, { method: 'online' });
      toast.success('Purchase initiated');
      // In a real app, redirect to payment page or transaction detail
      // nav(`/transactions/${res?.data?.id || ''}`)
    } catch (e) { errorHandler(e, 'Failed to start checkout'); }
  };

  return (
    <section className="p-4 space-y-4 max-w-screen-lg mx-auto">
      {loading && <Spinner size={32} />}
      {!loading && !item && <div className="opacity-60">Not found</div>}
      {!!item && (
        <div className="space-y-4">
          <div className="flex items-start gap-6 flex-col md:flex-row">
            <div className="w-full md:w-1/2 relative">
              {media.length > 0 ? (
                <div className="space-y-2">
                  <div className="relative">
                    <img
                      src={media[current]?.url}
                      alt={tr?.title || `#${item.id}`}
                      className="w-full aspect-square object-cover rounded"
                    />
                    <button className={`btn btn-circle btn-sm absolute right-2 top-2 ${fav?'btn-error':'btn-ghost'}`} onClick={onToggleFav} title="Favorite">
                      {fav ? '♥' : '♡'}
                    </button>
                  {media.length > 1 && (
                      <>
                        <button className="btn btn-circle btn-sm absolute left-2 top-1/2 -translate-y-1/2" onClick={onPrev}>&lt;</button>
                        <button className="btn btn-circle btn-sm absolute right-2 top-1/2 -translate-y-1/2" onClick={onNext}>&gt;</button>
                      </>
                    )}
                  </div>
                  {media.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {media.map((m, idx) => (
                        <img
                          key={m.id}
                          src={m.url}
                          onClick={() => setCurrent(idx)}
                          className={`h-16 w-16 object-cover rounded cursor-pointer border ${idx===current?'border-primary':'border-base-300'}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-base-200 rounded aspect-square flex items-center justify-center">No media</div>
              )}
            </div>
            <div className="flex-1 space-y-3 w-full">
              <h1 className="text-2xl font-bold break-words">{tr?.title || `#${item.id}`}</h1>
              <div className="text-xl font-semibold">{item.priceAmount} {item.currency}</div>
              <div className="opacity-70 text-sm space-x-2">
                <span>#{item.id}</span>
                <span>•</span>
                <span>{item.condition}</span>
                {item.locationCity && (<>
                  <span>•</span>
                  <span>{item.locationCity}</span>
                </>)}
                {item.categoryId && catName && (<>
                  <span>•</span>
                  <a className="link" href={`/listings?categoryId=${item.categoryId}`}>{catName}</a>
                </>)}
              </div>
              {tr?.description && (
                <div className="prose max-w-none whitespace-pre-wrap">{tr.description}</div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {!isOwner && item?.status === 'active' && (
                  <>
                    {item.allowCheckout && (
                      <button className="btn btn-success" onClick={onBuyNow}>Buy Now</button>
                    )}
                    <button className="btn btn-primary" onClick={() => setOfferOpen(true)}>Make Offer</button>
                    <button className="btn" onClick={onMessageSeller}>Message Seller</button>
                  </>
                )}
                {isOwner && (
                  <div className="opacity-70">You are the owner</div>
                )}
              </div>
            </div>
          </div>

          {offerOpen && (
            <div className="modal modal-open">
              <div className="modal-box">
                <h3 className="font-bold text-lg mb-3">Send Offer</h3>
                <div className="space-y-3">
                  <label className="form-control">
                    <span className="label-text">Amount ({item.currency})</span>
                    <input type="number" className="input input-bordered" value={offer.amount} onChange={(e)=>setOffer((s)=>({ ...s, amount: e.target.value }))} />
                  </label>
                  <label className="form-control">
                    <span className="label-text">Message (optional)</span>
                    <textarea className="textarea textarea-bordered" rows={3} value={offer.message} onChange={(e)=>setOffer((s)=>({ ...s, message: e.target.value }))} />
                  </label>
                </div>
                <div className="modal-action">
                  <button className="btn btn-ghost" onClick={()=>setOfferOpen(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={onSubmitOffer}>Send</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

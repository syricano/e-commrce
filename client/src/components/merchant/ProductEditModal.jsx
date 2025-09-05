import { useEffect, useState } from 'react';
import axiosInstance from '@/config/axiosConfig';
import { useLang } from '@/context/LangProvider';
import { errorHandler } from '@/utils';

export default function ProductEditModal({ open, itemId, onClose, onUpdated }) {
  const { t } = useLang();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [form, setForm] = useState({ name:'', description:'', stockOnHand:0, basePrice:'' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!itemId) return;
    setLoading(true);
    try {
      // try list with id param
      const res = await axiosInstance.get(`/store-products`, { params: { id: itemId } });
      const data = Array.isArray(res?.data) ? res.data.find(x=>Number(x.id)===Number(itemId)) : null;
      let d = data;
      if (!d) {
        // fallback to /:id if available
        try {
          const res2 = await axiosInstance.get(`/store-products/${itemId}`);
          d = res2?.data || null;
        } catch {}
      }
      if (d) {
        setItem(d);
        setForm({
          name: d.name || '',
          description: d.description || '',
          stockOnHand: Number(d.stockOnHand || 0),
          basePrice: d?.attributes?.base_price ?? '',
        });
      }
    } catch (e) {
      errorHandler(e, t('Failed to load') || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && itemId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, itemId]);

  const onSave = async () => {
    if (!itemId) return;
    setSaving(true);
    try {
      await axiosInstance.put(`/store-products/${itemId}`, {
        name: String(form.name || '').trim(),
        description: String(form.description || '').trim(),
        stockOnHand: Number(form.stockOnHand) || 0,
        attributes: { ...(item?.attributes||{}), base_price: form.basePrice === '' ? null : Math.max(0, Math.round(Number(form.basePrice)||0)) },
      });
      onUpdated?.();
      onClose?.();
    } catch (e) {
      errorHandler(e, t('Update failed') || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const onUpload = async (file) => {
    if (!itemId || !file) return;
    try {
      const base64 = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = reject;
        r.readAsDataURL(file);
      });
      const filename = `${Date.now()}_${file.name}`;
      const upRes = await axiosInstance.post('/merchant/upload', { filename, data: base64 });
      const url = upRes?.data?.url;
      if (url) await axiosInstance.post(`/store-products/${itemId}/media`, { url });
      await onUpdated?.();
      await load();
    } catch (e) {
      errorHandler(e, t('Upload failed') || 'Upload failed');
    }
  };

  const onDeleteMedia = async (mediaId) => {
    if (!itemId || !mediaId) return;
    try {
      await axiosInstance.delete(`/store-products/${itemId}/media/${mediaId}`);
      await onUpdated?.();
      await load();
    } catch (e) {
      errorHandler(e, t('Delete failed') || 'Delete failed');
    }
  };

  const onDeleteProduct = async () => {
    if (!itemId) return;
    if (!confirm(t('Delete product?') || 'Delete product?')) return;
    try {
      await axiosInstance.delete(`/store-products/${itemId}`);
      onClose?.();
      await onUpdated?.();
    } catch (e) {
      errorHandler(e, t('Delete failed') || 'Delete failed');
    }
  };

  const imgSrc = (u) => {
    const img = u || '';
    return img && !/^https?:\/\//.test(img)
      ? `${import.meta.env.VITE_FILES_BASE_URL || ''}${img.startsWith('/')? '' : '/'}${img}`
      : img;
  };

  if (!open) return null;

  return (
    <dialog open className="modal">
      <div className="modal-box max-w-2xl space-y-4">
        <h3 className="font-bold text-lg">{t('Edit Product') || 'Edit Product'}</h3>

        {loading ? (
          <div className="opacity-60">{t('Loading…') || 'Loading…'}</div>
        ) : (
          <>
            <label className="form-control">
              <span className="label-text">{t('Name') || 'Name'}</span>
              <input
                className="input input-bordered"
                value={form.name}
                onChange={(e)=>setForm(s=>({ ...s, name:e.target.value }))}
              />
            </label>

            <label className="form-control">
              <span className="label-text">{t('Description') || 'Description'}</span>
              <textarea
                className="textarea textarea-bordered"
                rows={3}
                value={form.description}
                onChange={(e)=>setForm(s=>({ ...s, description:e.target.value }))}
              />
            </label>

            <label className="form-control">
              <span className="label-text">{t('Stock') || 'Stock'}</span>
              <input
                className="input input-bordered"
                type="number"
                min="0"
                value={form.stockOnHand}
                onChange={(e)=>setForm(s=>({ ...s, stockOnHand:e.target.value }))}
              />
            </label>

            <label className="form-control">
              <span className="label-text">{t('Base Price') || 'Base Price'}</span>
              <input
                className="input input-bordered"
                type="number"
                min="0"
                value={form.basePrice}
                onChange={(e)=>setForm(s=>({ ...s, basePrice: e.target.value }))}
              />
            </label>

            <div>
              <div className="font-medium mb-2">{t('Images') || 'Images'}</div>
              <div className="flex items-center gap-2 flex-wrap">
                {(item?.media || []).map((m) => (
                  <div key={m.id} className="relative">
                    <img src={imgSrc(m.url)} alt="" className="w-16 h-16 object-cover rounded" />
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs absolute -top-2 -right-2"
                      onClick={()=>onDeleteMedia(m.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <label className="btn btn-sm">
                  {t('Add Image') || 'Add Image'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e)=>{ const f=e.target.files?.[0]; if (f) onUpload(f); }}
                  />
                </label>
              </div>
            </div>
          </>
        )}

        <div className="modal-action">
          <button className="btn btn-error btn-outline" onClick={onDeleteProduct}>
            {t('Delete') || 'Delete'}
          </button>
          <button className={`btn ${saving?'btn-disabled':''}`} onClick={onSave}>
            {t('Update') || 'Update'}
          </button>
          <button className="btn btn-ghost" onClick={onClose}>
            {t('Close') || 'Close'}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>{t('Close') || 'Close'}</button>
      </form>
    </dialog>
  );
}

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/config/axiosConfig';
import usePageTitle from '@/hooks/usePageTitle';
import { errorHandler } from '@/utils';
import { useLang } from '@/context/LangProvider';

export default function StoreAssets() {
  const { id } = useParams();
  usePageTitle('Store Assets');
  const { t } = useLang();
  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const load = async () => {
    try { const res = await axiosInstance.get(`/merchant/stores/${id}`); const s = res?.data || {}; setLogoUrl(s.logoUrl || ''); setCoverUrl(s.coverUrl || ''); }
    catch (e) { errorHandler(e, t('Failed to load') || 'Failed to load'); }
  };
  useEffect(()=>{ load(); }, [id]);

  const toBase64 = (file) => new Promise((resolve, reject) => { const r = new FileReader(); r.onload=()=>resolve(r.result); r.onerror=reject; r.readAsDataURL(file); });
  const up = async (file, setter) => {
    try { setUploading(true); const base64 = await toBase64(file); const filename = `${Date.now()}_${file.name}`; const upRes = await axiosInstance.post('/merchant/upload', { filename, data: base64 }); const url = upRes?.data?.url; if (url) setter(url); }
    catch (e) { errorHandler(e, t('Upload failed') || 'Upload failed'); }
    finally { setUploading(false); }
  };
  const save = async () => {
    try { await axiosInstance.put(`/merchant/stores/${id}/settings`, { logoUrl, coverUrl }); await load(); }
    catch (e) { errorHandler(e, t('Failed to save') || 'Failed to save'); }
  };

  const resolve = (url) => (url && !/^https?:\/\//.test(url) ? `${import.meta.env.VITE_FILES_BASE_URL || ''}${url.startsWith('/')?'':'/'}${url}` : url);

  return (
    <section className="p-4 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">{t('Store')} {id} — {t('Assets')}</h1>
      <div className="card bg-base-100 border"><div className="card-body grid md:grid-cols-2 gap-3">
        <div>
          <div className="font-semibold mb-2">{t('Logo') || 'Logo'}</div>
          {logoUrl ? <img src={resolve(logoUrl)} alt="logo" className="w-32 h-32 object-cover rounded mb-2" /> : <div className="w-32 h-32 bg-base-200 rounded mb-2" />}
          <label className="btn btn-sm">{uploading?(t('Uploading…') || 'Uploading…'):(t('Upload Logo') || 'Upload Logo')}<input hidden type="file" accept="image/*" onChange={e=>{ const f=e.target.files?.[0]; if (f) up(f, setLogoUrl); }} /></label>
        </div>
        <div>
          <div className="font-semibold mb-2">{t('Cover') || 'Cover'}</div>
          {coverUrl ? <img src={resolve(coverUrl)} alt="cover" className="w-full h-32 object-cover rounded mb-2" /> : <div className="w-full h-32 bg-base-200 rounded mb-2" />}
          <label className="btn btn-sm">{uploading?(t('Uploading…') || 'Uploading…'):(t('Upload Cover') || 'Upload Cover')}<input hidden type="file" accept="image/*" onChange={e=>{ const f=e.target.files?.[0]; if (f) up(f, setCoverUrl); }} /></label>
        </div>
        <div className="md:col-span-2 text-right">
          <button className="btn btn-primary" onClick={save}>{t('save') || 'Save'}</button>
        </div>
      </div></div>
    </section>
  );
}

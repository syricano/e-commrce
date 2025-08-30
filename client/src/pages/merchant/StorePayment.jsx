import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/config/axiosConfig';
import usePageTitle from '@/hooks/usePageTitle';
import StoreNav from '@/components/merchant/StoreNav.jsx';
import { errorHandler } from '@/utils';
import { useLang } from '@/context/LangProvider';

export default function StorePayment() {
  const { id } = useParams();
  usePageTitle('Store Payment');
  const { t } = useLang();
  const [payments, setPayments] = useState({ cash:false, bank:false, online:false, invoice:false });
  const load = async () => {
    try {
      const res = await axiosInstance.get(`/merchant/stores/${id}`);
      const s = res?.data || {};
      const prefs = s?.preferredPayments || [];
      setPayments({ cash:prefs.includes('cash'), bank:prefs.includes('bank'), online:prefs.includes('online'), invoice:prefs.includes('invoice') });
    } catch (e) { errorHandler(e, t('Failed to load') || 'Failed to load'); }
  };
  useEffect(()=>{ load(); }, [id]);
  const save = async () => {
    const arr = Object.keys(payments).filter(k => payments[k]);
    try { await axiosInstance.put(`/merchant/stores/${id}/settings`, { preferredPayments: arr }); await load(); }
    catch (e) { errorHandler(e, t('Failed to save') || 'Failed to save'); }
  };
  return (
    <section className="p-4 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">{t('Store')} {id} — {t('Payment')}</h1>
      <StoreNav />
      <div className="card bg-base-100 border"><div className="card-body space-y-3">
        {['cash','bank','online','invoice'].map(k => (
          <label key={k} className="flex items-center gap-2">
            <input type="checkbox" className="toggle" checked={payments[k]} onChange={(e)=>setPayments(s=>({...s, [k]:e.target.checked}))} />
            <span>{t(k==='cash'?'Cash':k==='bank'?'Bank Transfer':k==='online'?'Online Payment':'Invoice')}</span>
          </label>
        ))}
        <div className="text-right"><button className="btn btn-primary" onClick={save}>{t('save') || 'Save'}</button></div>
      </div></div>
    </section>
  );
}

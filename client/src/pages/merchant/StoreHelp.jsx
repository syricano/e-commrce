import { useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/config/axiosConfig';
import usePageTitle from '@/hooks/usePageTitle';
import { errorHandler } from '@/utils';
import { toast } from 'react-hot-toast';
import { useLang } from '@/context/LangProvider';

export default function StoreHelp(){
  const { id } = useParams();
  usePageTitle('Store Help');
  const { t } = useLang();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const submit = async () => {
    try { await axiosInstance.post('/support/requests', { subject: subject || `${t('Store')} ${id} ${t('Help') || 'Help'}`, message }); toast.success(t('Sent') || 'Sent'); setSubject(''); setMessage(''); }
    catch (e) { errorHandler(e, t('Failed to send') || 'Failed to send'); }
  };
  return (
    <section className="p-4 max-w-3xl mx-auto space-y-3">
      <h1 className="text-2xl font-bold">{t('Request Help')} — {t('Store')} {id}</h1>
      <label className="form-control">
        <span className="label-text">{t('Subject') || 'Subject'}</span>
        <input className="input input-bordered" value={subject} onChange={e=>setSubject(e.target.value)} />
      </label>
      <label className="form-control">
        <span className="label-text">{t('Message') || 'Message'}</span>
        <textarea className="textarea textarea-bordered" rows={5} value={message} onChange={e=>setMessage(e.target.value)} />
      </label>
      <div className="text-right"><button className="btn btn-primary" onClick={submit}>{t('Send') || 'Send'}</button></div>
    </section>
  );
}

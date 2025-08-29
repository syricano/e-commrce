import usePageTitle from '@/hooks/usePageTitle';
import { useLang } from '@/context/LangProvider';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listThreads, listThreadMessages, sendMessage } from '@/services';
import { useAuth } from '@/context';
import Spinner from '@/components/UI/Spinner.jsx';

export default function Messages() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  usePageTitle('Messages');
  const [threads, setThreads] = useState([]);
  const [sp] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');
  const [templateKey, setTemplateKey] = useState('interest');

  const templates = (() => {
    const name = user?.firstName || user?.email || (lang==='ar'?'المستخدم':'User');
    if (lang === 'ar') return [
      { key:'interest', label:'استفسار عن التوفر', text:`مرحباً،\nأنا مهتم بهذا العرض.\nهل ما زال متاحاً؟\nشكراً،\n${name}` },
      { key:'offer', label:'تقديم عرض سعر', text:`مرحباً،\nأنا مهتم بالشراء.\nهل تقبل عرضاً أقل؟\nشكراً،\n${name}` },
      { key:'photos', label:'طلب صور إضافية', text:`مرحباً،\nهل يمكنك إرسال صور إضافية للمنتج؟\nشكراً،\n${name}` },
      { key:'location', label:'الاستفسار عن الموقع', text:`مرحباً،\nأين يقع المنتج؟ وهل يمكن ترتيب اللقاء؟\nشكراً،\n${name}` },
    ];
    return [
      { key:'interest', label:'Interested / Availability', text:`Hi,\nI'm interested in this offer.\nIs it still available?\nThanks,\n${name}` },
      { key:'offer', label:'Make an Offer', text:`Hi,\nI'm interested in buying.\nWould you consider a lower price?\nThanks,\n${name}` },
      { key:'photos', label:'Request More Photos', text:`Hi,\nCould you share a few more photos of the item?\nThanks,\n${name}` },
      { key:'location', label:'Location / Meeting', text:`Hi,\nWhere are you located? Can we arrange a meeting?\nThanks,\n${name}` },
    ];
  })();

  useEffect(() => {
    setLoading(true);
    listThreads({})
      .then((res) => {
        const xs = res?.data || res || [];
        setThreads(xs);
        const qId = sp.get('threadId');
        if (qId) setActiveId(Number(qId));
        const prefill = sp.get('prefill');
        if (prefill) setText(prefill);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeId) return setMsgs([]);
    listThreadMessages(activeId).then((res)=>setMsgs(res?.data || res || [])).catch(()=>{});
  }, [activeId]);

  const onSend = async () => {
    const body = (text||'').trim();
    if (!body || !activeId) return;
    setSending(true);
    try {
      await sendMessage(activeId, { body });
      setText('');
      const res = await listThreadMessages(activeId);
      setMsgs(res?.data || res || []);
    } finally { setSending(false); }
  };

  return (
    <section className="p-4">
      <h1 className="text-xl font-semibold mb-4">{t('Messages') || 'Messages'}</h1>
      <div className="grid grid-cols-12 gap-4">
        <aside className="col-span-12 md:col-span-4 lg:col-span-3">
          <div className="card bg-base-200">
            <div className="card-body p-3">
              {loading && <Spinner size={24} />}
              <ul className="menu menu-sm">
                {threads.map(th => (
                  <li key={th.id}>
                    <button className={activeId===th.id?'active':''} onClick={()=>setActiveId(th.id)}>
                      <div className="flex flex-col text-left">
                        <span>Thread #{th.id}</span>
                        <span className="opacity-70 text-xs">Listing #{th.listingId}</span>
                      </div>
                    </button>
                  </li>
                ))}
                {threads.length===0 && !loading && (<li className="px-2 py-1 opacity-60">No threads</li>)}
              </ul>
            </div>
          </div>
        </aside>

        <main className="col-span-12 md:col-span-8 lg:col-span-9">
          <div className="card bg-base-200 h-[60vh]">
            <div className="card-body p-3 flex flex-col h-full">
              <div className="flex-1 overflow-y-auto space-y-2">
                {msgs.map(m => (
                  <div key={m.id} className="chat chat-start">
                    <div className="chat-bubble">{m.body}</div>
                    <div className="chat-footer opacity-60 text-xs">{new Date(m.createdAt).toLocaleString()}</div>
                  </div>
                ))}
                {msgs.length===0 && (<div className="opacity-60">Select a thread</div>)}
              </div>
              <div className="mt-2 flex gap-2 items-stretch flex-wrap">
                <label className="form-control w-full sm:w-auto">
                  <span className="label-text">{lang==='ar'?'قوالب':'Templates'}</span>
                  <select
                    className="select select-bordered"
                    value={templateKey}
                    onChange={(e)=>{
                      const val = e.target.value;
                      setTemplateKey(val);
                      const found = templates.find(t=>t.key===val) || templates[0];
                      setText(found.text);
                    }}
                  >
                    {templates.map(tpl => <option key={tpl.key} value={tpl.key}>{tpl.label}</option>)}
                  </select>
                </label>
                <div className="flex-1 min-w-[240px]" />
                <input className="input input-bordered flex-1 min-w-[240px]" value={text} onChange={(e)=>setText(e.target.value)} placeholder={lang==='ar'?'اكتب رسالة':'Type a message'} onKeyDown={(e)=>{ if(e.key==='Enter') onSend(); }} />
                <button className="btn btn-primary" onClick={onSend} disabled={sending || !activeId || !text.trim()}>{sending?'…':(lang==='ar'?'إرسال':'Send')}</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
}

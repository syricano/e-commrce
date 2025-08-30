import { useEffect, useMemo, useState } from 'react';
import { createCrud } from '@/services';
import { errorHandler } from '@/utils';
import { toast } from 'react-hot-toast';
import { useLang } from '@/context/LangProvider';
import usePageTitle from '@/hooks/usePageTitle';

const api = createCrud('/media');

export default function ManageMedia() {
  const { t } = useLang();
  usePageTitle('ManageMedia');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.list({ limit: 200 });
      setItems(res?.items || res?.data?.items || res?.data || []);
    } catch (e) { errorHandler(e, 'Failed to load media'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const remove = async (m) => {
    if (!confirm(`${t('delete')} media #${m.id}?`)) return;
    try { await api.remove(m.id); toast.success(t('delete')); load(); }
    catch (e) { errorHandler(e, 'Delete failed'); }
  };

  const table = useMemo(() => (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>{t('ID') || 'ID'}</th>
            <th>{t('Type') || 'Type'}</th>
            <th>{t('URL') || 'URL'}</th>
            <th>{t('Product') || 'Product'}</th>
            <th>{t('Variant') || 'Variant'}</th>
            <th className="text-right">{t('Actions') || 'Actions'}</th>
          </tr>
        </thead>
        <tbody>
          {items.map(m => (
            <tr key={m.id}>
              <td>{m.id}</td>
              <td>{m.type}</td>
              <td className="max-w-xl truncate"><a href={m.url} target="_blank" rel="noreferrer" className="link">{m.url}</a></td>
              <td>{m.productId || '—'}</td>
              <td>{m.variantId || '—'}</td>
              <td className="text-right">
                <button className="btn btn-error btn-xs" onClick={()=>remove(m)}>{t('delete')}</button>
              </td>
            </tr>
          ))}
          {items.length===0 && !loading && (
            <tr><td colSpan={6} className="text-center opacity-60 py-6">{t('noItems')}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  ), [items, loading, t]);

  return (
    <section className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">{t('ManageMedia') || t('Media') || 'Manage Media'}</h1>
      <div>
        <button className="btn" onClick={load} disabled={loading}>{loading?'…':t('refresh')}</button>
      </div>
      {table}
    </section>
  );
}

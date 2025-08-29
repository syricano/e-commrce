// client/src/pages/admin/_CrudPage.jsx
import { useEffect, useMemo, useState } from 'react';
import { createCrud } from '@/services';
import { errorHandler } from '@/utils';
import { toast } from 'react-hot-toast';
import { useLang } from '@/context/LangProvider';
import usePageTitle from '@/hooks/usePageTitle';

export default function CrudPage({ title, base, columns }) {
  const { t } = useLang();
  usePageTitle(title);
  const api = useMemo(() => createCrud(base), [base]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [drafts, setDrafts] = useState({}); // id -> partial patch
  const [creating, setCreating] = useState(false);
  const [createData, setCreateData] = useState({});

  const load = (params = {}) => {
    setLoading(true);
    api.list({ q: q || undefined, ...params })
      .then((res) => setItems(res?.data?.items || res?.items || res || []))
      .catch((e) => errorHandler(e, `Failed to load ${t(title)}`))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const onChangeCell = (id, key, val) =>
    setDrafts((d) => ({ ...d, [id]: { ...(d[id] || {}), [key]: val } }));

  const onSaveRow = async (id) => {
    const patch = drafts[id];
    if (!patch || !Object.keys(patch).length) return;
    try {
      await api.update(id, patch);
      toast.success(t('save'));
      setDrafts((d) => { const n = { ...d }; delete n[id]; return n; });
      load();
    } catch (e) { errorHandler(e, 'Save failed'); }
  };

  const onDeleteRow = async (id) => {
    if (!confirm(`${t('delete')}?`)) return;
    try { await api.remove(id); toast.success(t('delete')); load(); }
    catch (e) { errorHandler(e, t('delete')); }
  };

  const startCreate = () => { setCreateData({}); setCreating(true); };
  const doCreate = async () => {
    try { await api.create(createData); toast.success(t('create')); setCreating(false); load(); }
    catch (e) { errorHandler(e, t('create')); }
  };

  const table = useMemo(() => (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            {columns.map(c => <th key={c.key} style={c.width ? {width:c.width} : undefined}>{t(c.label) || c.label}</th>)}
            <th className="text-right">{t('Actions') || 'Actions'}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id}>
              {columns.map((c) => {
                const val = (drafts[it.id]?.[c.key] ?? it?.[c.key]) ?? '';
                if (c.type === 'bool') {
                  return (
                    <td key={c.key}>
                      <input
                        type="checkbox"
                        className="toggle toggle-xs"
                        checked={!!val}
                        onChange={(e)=>onChangeCell(it.id, c.key, e.target.checked)}
                      />
                    </td>
                  );
                }
                if (c.type === 'select' && Array.isArray(c.options)) {
                  return (
                    <td key={c.key}>
                      <select
                        className="select select-bordered select-xs w-full"
                        value={val}
                        onChange={(e)=>onChangeCell(it.id, c.key, e.target.value)}
                      >
                        {c.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </td>
                  );
                }
                if (c.editable) {
                  return (
                    <td key={c.key}>
                      <input
                        className="input input-bordered input-xs w-full"
                        value={val}
                        onChange={(e)=>onChangeCell(it.id, c.key, e.target.value)}
                      />
                    </td>
                  );
                }
                return <td key={c.key} className="whitespace-nowrap">{String(val ?? '')}</td>;
              })}
              <td className="text-right space-x-2">
                <button className="btn btn-primary btn-xs" onClick={()=>onSaveRow(it.id)}>{t('save')}</button>
                <button className="btn btn-error btn-xs" onClick={()=>onDeleteRow(it.id)}>{t('delete')}</button>
              </td>
            </tr>
          ))}
          {items.length === 0 && !loading && (
            <tr><td colSpan={columns.length+1} className="text-center opacity-60 py-6">{t('noItems')}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  ), [items, drafts, loading, columns]);

  return (
    <section className="p-4 space-y-4">
      <div className="flex items-end gap-2 flex-wrap">
        <div className="flex-1 min-w-56">
          <label className="form-control">
            <span className="label-text">{t('search')}</span>
            <input className="input input-bordered" value={q} onChange={(e)=>setQ(e.target.value)} placeholder={t('search')} />
          </label>
        </div>
        <button className="btn btn-primary" onClick={()=>load()} disabled={loading}>{loading ? '...' : t('search')}</button>
        <button className="btn" onClick={startCreate}>{t('addNew')}</button>
      </div>

      <h1 className="text-xl font-semibold">{t(title)}</h1>
      {table}

      {creating && (
        <dialog open className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">{t('create')} {t(title)}</h3>
            <div className="mt-3 grid gap-2">
              {columns.filter(c=>c.editable || c.create).map(c=>(
                <label key={c.key} className="form-control">
                  <span className="label-text">{c.label}</span>
                  {c.type === 'bool' ? (
                    <input
                      type="checkbox"
                      className="toggle"
                      checked={!!createData[c.key]}
                      onChange={(e)=>setCreateData((s)=>({ ...s, [c.key]: e.target.checked }))}
                    />
                  ) : c.type === 'select' && Array.isArray(c.options) ? (
                    <select
                      className="select select-bordered"
                      value={createData[c.key] ?? ''}
                      onChange={(e)=>setCreateData((s)=>({ ...s, [c.key]: e.target.value }))}
                    >
                      {c.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input
                      className="input input-bordered"
                      value={createData[c.key] ?? ''}
                      onChange={(e)=>setCreateData((s)=>({ ...s, [c.key]: e.target.value }))}
                    />
                  )}
                </label>
              ))}
            </div>
            <div className="modal-action">
              <button className="btn" onClick={()=>setCreating(false)}>{t('cancel')}</button>
              <button className="btn btn-primary" onClick={doCreate}>{t('create')}</button>
            </div>
          </div>
        </dialog>
      )}
    </section>
  );
}

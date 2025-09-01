import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { errorHandler } from '@/utils';
import { useLang } from '@/context/LangProvider';
import { Categories, CategoryTranslations } from '@/services/api';
import { slugify } from '@/utils/strings';


const LOCALES = ['en', 'ar'];

const unpack = (res) => res?.data?.items ?? res?.data ?? res?.items ?? res ?? [];


const buildTrIndex = (trs) => {
  const idx = {};
  for (const t of trs) {
    if (!idx[t.categoryId]) idx[t.categoryId] = {};
    idx[t.categoryId][t.locale] = t;
  }
  return idx;
};

export default function ManageCategories() {
  const { t } = useLang();
  const [cats, setCats] = useState([]);
  const [trIndex, setTrIndex] = useState({});
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [busySave, setBusySave] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [catsRes, trsRes] = await Promise.all([
        Categories.list({ limit: 1000 }),
        CategoryTranslations.list({ limit: 5000 }),
      ]);
      const c = unpack(catsRes);
      const t = unpack(trsRes);
      setCats(Array.isArray(c) ? c : []);
      setTrIndex(buildTrIndex(Array.isArray(t) ? t : []));
    } catch (e) {
      errorHandler(e, t('Failed to load categories') || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Build hierarchical ordering for categories
  const hierOrdered = useMemo(() => {
    const byParent = new Map();
    const all = Array.isArray(cats) ? cats : [];
    for (const c of all) {
      const p = c.parentId || null;
      if (!byParent.has(p)) byParent.set(p, []);
      byParent.get(p).push(c);
    }
    // stable sort children by position then id
    for (const list of byParent.values()) list.sort((a,b)=> (a.position||0)-(b.position||0) || (a.id-b.id));
    const out = [];
    const visit = (node, depth) => {
      out.push({ ...node, __depth: depth });
      const children = byParent.get(node.id) || [];
      for (const ch of children) visit(ch, depth + 1);
    };
    const roots = byParent.get(null) || byParent.get(undefined) || byParent.get(0) || [];
    // include nodes whose parent is missing as roots too
    const rootSet = new Set(roots.map(r=>r.id));
    for (const c of all) if (!rootSet.has(c.id) && !byParent.has(c.parentId||null)) roots.push(c);
    for (const r of roots) visit(r, 0);
    return out;
  }, [cats]);

  const filtered = useMemo(() => {
    const list = hierOrdered;
    if (!query.trim()) return list;
    const q = query.trim().toLowerCase();
    return list.filter((c) => {
      const en = trIndex[c.id]?.en?.name?.toLowerCase() || '';
      const ar = trIndex[c.id]?.ar?.name?.toLowerCase() || '';
      const slug = trIndex[c.id]?.en?.slug?.toLowerCase() || trIndex[c.id]?.ar?.slug?.toLowerCase() || '';
      return String(c.id).includes(q) || en.includes(q) || ar.includes(q) || slug.includes(q);
    });
  }, [hierOrdered, trIndex, query]);

  const nameOf = (cId, pref = 'en') =>
    trIndex[cId]?.[pref]?.name || trIndex[cId]?.en?.name || trIndex[cId]?.ar?.name || `#${cId}`;

  const beginCreate = () => {
    setEditing({
      base: { parentId: '', position: 0, isActive: true, metadata: {} },
      tr: {
        en: { locale: 'en', name: '', slug: '', metaTitle: '', metaDescription: '' },
        ar: { locale: 'ar', name: '', slug: '', metaTitle: '', metaDescription: '' },
      },
    });
  };

  const beginEdit = (row) => {
    const tEn = trIndex[row.id]?.en || { locale: 'en', name: '', slug: '', metaTitle: '', metaDescription: '' };
    const tAr = trIndex[row.id]?.ar || { locale: 'ar', name: '', slug: '', metaTitle: '', metaDescription: '' };
    setEditing({
      base: { id: row.id, parentId: row.parentId ?? '', position: row.position ?? 0, isActive: !!row.isActive, metadata: row.metadata || {} },
      tr: { en: { ...tEn }, ar: { ...tAr } },
    });
  };

  const cancelEdit = () => setEditing(null);

  const save = async () => {
    if (!editing) return;
    setBusySave(true);
    try {
      const { base, tr } = editing;
      let saved = null;
      if (base.id) {
        const patch = { parentId: base.parentId || null, position: Number(base.position) || 0, isActive: !!base.isActive, metadata: base.metadata || {} };
        const res = await Categories.update(base.id, patch);
        saved = res?.data ?? res ?? patch;
        toast.success('Category updated');
      } else {
        const body = { parentId: base.parentId || null, position: Number(base.position) || 0, isActive: !!base.isActive, metadata: base.metadata || {} };
        const res = await Categories.create(body);
        saved = res?.data ?? res ?? body;
        toast.success('Category created');
      }

      const categoryId = saved.id ?? base.id;
      if (!categoryId) throw new Error('Missing category id after save');

      for (const loc of LOCALES) {
        const prev = trIndex[categoryId]?.[loc];
        const current = tr[loc] || { locale: loc };
        const payload = {
          categoryId,
          locale: loc,
          name: (current.name || '').trim(),
          slug: (current.slug || slugify(current.name)).trim(),
          metaTitle: (current.metaTitle || '').trim() || null,
          metaDescription: (current.metaDescription || '').trim() || null,
        };
        if (prev?.id) {
          await CategoryTranslations.update(prev.id, payload);
        } else if (payload.name) {
          await CategoryTranslations.create(payload);
        }
      }

      await load();
      setEditing(null);
    } catch (e) {
      errorHandler(e, 'Save failed');
    } finally { setBusySave(false); }
  };

  const remove = async (row) => {
    if (!confirm(`${t('Delete')} ${t('Category') || 'Category'} #${row.id}? ${t('This cannot be undone.') || 'This cannot be undone.'}`)) return;
    try {
      await Categories.remove(row.id);
      toast.success(t('Category deleted') || 'Category deleted');
      setCats((s) => s.filter((x) => x.id !== row.id));
      const copy = { ...trIndex };
      delete copy[row.id];
      setTrIndex(copy);
    } catch (e) { errorHandler(e, t('Delete failed') || 'Delete failed'); }
  };

  return (
    <section className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">{t('ManageCategories') || 'Manage Categories'}</h1>
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>{loading ? '…' : (t('refresh') || 'Refresh')}</button>
          <button className="btn btn-primary btn-sm" onClick={beginCreate}>{t('New Category') || 'New Category'}</button>
        </div>
      </div>

      <div className="flex items-end gap-2 flex-wrap">
        <label className="form-control min-w-64">
          <span className="label-text">{t('search') || 'Search'}</span>
          <input className="input input-bordered" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('id, name, slug…') || 'id, name, slug…'} />
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>{t('ID') || 'ID'}</th><th>{t('Name (EN)') || 'Name (EN)'}</th><th>{t('Name (AR)') || 'Name (AR)'}</th><th>{t('Parent') || 'Parent'}</th><th>{t('Position') || 'Position'}</th><th>{t('Active') || 'Active'}</th><th className="text-right">{t('Actions') || 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td className="whitespace-nowrap">
                  <span style={{ paddingInlineStart: (c.__depth || 0) * 16 }}>{trIndex[c.id]?.en?.name || '—'}</span>
                </td>
                <td className="whitespace-nowrap">
                  <span style={{ paddingInlineStart: (c.__depth || 0) * 16 }}>{trIndex[c.id]?.ar?.name || '—'}</span>
                </td>
                <td className="whitespace-nowrap">{c.parentId ? nameOf(c.parentId) : '—'}</td>
                <td>{c.position ?? 0}</td>
                <td>
                  <input type="checkbox" className="toggle toggle-sm" checked={!!c.isActive} onChange={async (e) => {
                    const next = !!e.target.checked;
                    try {
                      await Categories.update(c.id, { isActive: next });
                      setCats((s) => s.map((x) => (x.id === c.id ? { ...x, isActive: next } : x)));
                    } catch (err) { errorHandler(err, t('Failed to toggle') || 'Failed to toggle'); }
                  }} />
                </td>
                <td className="text-right space-x-2">
                  <button className="btn btn-xs" onClick={() => beginEdit(c)}>{t('Edit') || 'Edit'}</button>
                  <button className="btn btn-error btn-xs" onClick={() => remove(c)}>{t('Delete') || 'Delete'}</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && !loading && (<tr><td colSpan={7} className="text-center opacity-60 py-6">{t('No categories') || 'No categories'}</td></tr>)}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="card bg-base-200">
          <div className="card-body space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="card-title">{editing.base.id ? `${t('Edit') || 'Edit'} #${editing.base.id}` : (t('Create category') || 'Create category')}</h2>
              <div className="flex gap-2">
                <button className="btn btn-ghost btn-sm" onClick={cancelEdit} disabled={busySave}>{t('cancel') || 'Cancel'}</button>
                <button className="btn btn-primary btn-sm" onClick={save} disabled={busySave}>{busySave ? (t('Saving…') || 'Saving…') : (t('save') || 'Save')}</button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              <label className="form-control">
                <span className="label-text">{t('Parent') || 'Parent'}</span>
                <select className="select select-bordered" value={editing.base.parentId} onChange={(e) => setEditing((s) => ({ ...s, base: { ...s.base, parentId: e.target.value || '' } }))}>
                  <option value="">{t('— none —') || '— none —'}</option>
                  {cats.filter((x) => x.id !== editing.base.id).map((x) => (<option key={x.id} value={x.id}>{nameOf(x.id)}</option>))}
                </select>
              </label>

              <label className="form-control">
                <span className="label-text">{t('Position') || 'Position'}</span>
                <input type="number" className="input input-bordered" value={editing.base.position} onChange={(e) => setEditing((s) => ({ ...s, base: { ...s.base, position: e.target.value } }))} />
              </label>

              <label className="form-control">
                <span className="label-text">{t('Active') || 'Active'}</span>
                <input type="checkbox" className="toggle" checked={!!editing.base.isActive} onChange={(e) => setEditing((s) => ({ ...s, base: { ...s.base, isActive: e.target.checked } }))} />
              </label>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {LOCALES.map((loc) => (
                <div key={loc} className="card bg-base-100">
                  <div className="card-body gap-3">
                    <h3 className="font-semibold uppercase">{loc}</h3>
                    <label className="form-control">
                      <span className="label-text">{t('Name') || 'Name'}</span>
                      <input className="input input-bordered" value={editing.tr[loc]?.name || ''} onChange={(e) => setEditing((s) => ({ ...s, tr: { ...s.tr, [loc]: { ...s.tr[loc], name: e.target.value } } }))} placeholder={loc === 'en' ? 'e.g. Phones' : 'مثال: هواتف'} />
                    </label>
                    <label className="form-control">
                      <span className="label-text">{t('Slug') || 'Slug'}</span>
                      <input className="input input-bordered" value={editing.tr[loc]?.slug || ''} onChange={(e) => setEditing((s) => ({ ...s, tr: { ...s.tr, [loc]: { ...s.tr[loc], slug: e.target.value } } }))} placeholder={t('auto if blank') || 'auto if blank'} />
                    </label>
                    <label className="form-control">
                      <span className="label-text">{t('Meta title') || 'Meta title'}</span>
                      <input className="input input-bordered" value={editing.tr[loc]?.metaTitle || ''} onChange={(e) => setEditing((s) => ({ ...s, tr: { ...s.tr, [loc]: { ...s.tr[loc], metaTitle: e.target.value } } }))} />
                    </label>
                    <label className="form-control">
                      <span className="label-text">{t('Meta description') || 'Meta description'}</span>
                      <textarea className="textarea textarea-bordered" rows={3} value={editing.tr[loc]?.metaDescription || ''} onChange={(e) => setEditing((s) => ({ ...s, tr: { ...s.tr, [loc]: { ...s.tr[loc], metaDescription: e.target.value } } }))} />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

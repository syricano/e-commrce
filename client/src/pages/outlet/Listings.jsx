import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axiosInstance from '@/config/axiosConfig';
import usePageTitle from '@/hooks/usePageTitle';
import { useLang } from '@/context/LangProvider';
import { errorHandler } from '@/utils';
import Spinner from '@/components/UI/Spinner.jsx';
import { formatMoneyMajor } from '@/utils/money';

export default function Listings() {
  const { t, lang } = useLang();
  usePageTitle('Listings');
  const [sp, setSp] = useSearchParams();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cats, setCats] = useState([]);
  const [catTrs, setCatTrs] = useState([]);
  const [pageMeta, setPageMeta] = useState({ page: 1, limit: 24, total: 0 });
  const [showMoreAttrs, setShowMoreAttrs] = useState(false);
  const [selCatId, setSelCatId] = useState(() => sp.get('categoryId') || '');

  // keep local selected category in sync with querystring changes
  useEffect(() => {
    const qCat = sp.get('categoryId') || '';
    setSelCatId((cur) => (cur === qCat ? cur : qCat));
  }, [sp]);

  const params = useMemo(() => {
    const p = { limit: 24 };
    const cid = sp.get('categoryId');
    const minPrice = sp.get('minPrice');
    const maxPrice = sp.get('maxPrice');
    const condition = sp.get('condition');
    const sort = sp.get('sort');
    const page = sp.get('page');
    if (cid) p.categoryId = cid;
    if (minPrice) p.minPrice = minPrice;
    if (maxPrice) p.maxPrice = maxPrice;
    if (condition) p.condition = condition;
    if (sort) p.sort = sort;
    if (page) p.page = page;
    return p;
  }, [sp]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/listings', { params });
        const data = res?.data || {};
        setRows(data.items || data || []);
        if (typeof data.total === 'number') setPageMeta({ page: Number(data.page||1), limit: Number(data.limit||24), total: Number(data.total||0) });
      } catch (e) { errorHandler(e, t('Failed to load listings') || 'Failed to load listings'); }
      finally { setLoading(false); }
    };
    run();
  }, [params]);

  // Load categories + translations for labels
  useEffect(() => {
    let live = true;
    const loadCats = async () => {
      try {
        const [cRes, tRes] = await Promise.all([
          axiosInstance.get('/categories', { params: { limit: 1000 } }),
          axiosInstance.get('/category-translations', { params: { limit: 5000 } }).catch(()=>({ data: [] })),
        ]);
        if (!live) return;
        setCats(cRes?.data?.items || cRes?.data || []);
        setCatTrs(tRes?.data?.items || tRes?.data || []);
      } catch {}
    };
    loadCats();
    return () => { live = false; };
  }, []);

  const titleOf = (l) => {
    const trs = Array.isArray(l?.translations) ? l.translations : [];
    const by = {}; for (const t of trs) if (t?.locale) by[t.locale] = t;
    return by[lang]?.title || by.en?.title || by.ar?.title || trs[0]?.title || `#${l.id}`;
  };

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

  const CONDITIONS = ['new','used','refurbished'];
  const SORTS = [
    { value: 'new', label: t('Newest') || (lang==='ar' ? 'الأحدث' : 'Newest') },
    { value: 'price_asc', label: t('Price ↑') || (lang==='ar' ? 'السعر ↑' : 'Price ↑') },
    { value: 'price_desc', label: t('Price ↓') || (lang==='ar' ? 'السعر ↓' : 'Price ↓') },
    { value: 'popular', label: t('Popular') || (lang==='ar' ? 'الأكثر مشاهدة' : 'Popular') },
  ];

  const onFilterSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next = new URLSearchParams(sp);
    const pairs = [
      ['categoryId', fd.get('categoryId')],
      ['minPrice', fd.get('minPrice')],
      ['maxPrice', fd.get('maxPrice')],
      ['condition', fd.get('condition')],
      ['sort', fd.get('sort')],
    ];
    for (const [k, v] of pairs) {
      const val = (v || '').toString().trim();
      if (val) next.set(k, val); else next.delete(k);
    }
    // collect category-specific attrs (names starting with 'attr.')
    const attrs = {};
    for (const [k, v] of fd.entries()) {
      if (typeof k === 'string' && k.startsWith('attr.')) {
        const key = k.slice(5);
        const val = (v || '').toString().trim();
        if (val) attrs[key] = val;
      }
    }
    if (Object.keys(attrs).length) next.set('attrs', JSON.stringify(attrs)); else next.delete('attrs');
    next.delete('page');
    setSp(next, { replace: false });
  };

  // Applied filter chips
  const chips = useMemo(() => {
    const arr = [];
    const cid = sp.get('categoryId');
    if (cid) arr.push({ key: 'categoryId', label: catNameById.get(Number(cid)) || `#${cid}` });
    const minPrice = sp.get('minPrice'); if (minPrice) arr.push({ key:'minPrice', label:`≥ ${minPrice}` });
    const maxPrice = sp.get('maxPrice'); if (maxPrice) arr.push({ key:'maxPrice', label:`≤ ${maxPrice}` });
    const condition = sp.get('condition'); if (condition) arr.push({ key:'condition', label: condition });
    const sort = sp.get('sort'); if (sort) arr.push({ key:'sort', label: SORTS.find(s=>s.value===sort)?.label || sort });
    let attrsQS = {};
    try { attrsQS = JSON.parse(sp.get('attrs') || '{}'); } catch {}
    for (const [k,v] of Object.entries(attrsQS)) arr.push({ key:`attr.${k}`, label:`${k}: ${v}`, attrKey:k });
    return arr;
  }, [sp, catNameById, SORTS]);

  const removeChip = (chip) => {
    const next = new URLSearchParams(sp);
    if (chip.key.startsWith('attr.')) {
      let attrsObj = {};
      try { attrsObj = JSON.parse(next.get('attrs') || '{}'); } catch {}
      delete attrsObj[chip.attrKey];
      if (Object.keys(attrsObj).length) next.set('attrs', JSON.stringify(attrsObj)); else next.delete('attrs');
    } else {
      next.delete(chip.key);
    }
    next.delete('page');
    setSp(next, { replace: false });
  };

  // Numbered pagination helpers
  const pagination = useMemo(() => {
    const { page, limit, total } = pageMeta;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const p = Number(page) || 1;
    const pages = new Set([1, totalPages, p-2, p-1, p, p+1, p+2]);
    const sorted = [...pages].filter(x=>x>=1 && x<=totalPages).sort((a,b)=>a-b);
    const items = [];
    let last = 0;
    for (const n of sorted) {
      if (last && n > last + 1) items.push('…');
      items.push(n);
      last = n;
    }
    return { totalPages, items };
  }, [pageMeta]);

  // showMoreAttrs defined above

  return (
    <section className="p-4 max-w-screen-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t('Listings')}</h1>
      {/* Filters */}
      <form onSubmit={onFilterSubmit} className="mb-4 grid gap-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
        <label className="form-control">
          <span className="label-text">{t('Category') || 'Category'}</span>
          <select
            name="categoryId"
            className="select select-bordered"
            value={selCatId}
            onChange={(e)=>{ setSelCatId(e.target.value); setShowMoreAttrs(false); }}
          >
            <option value="">—</option>
            {cats.map(c => (
              <option key={c.id} value={c.id}>{catNameById.get(Number(c.id)) || c.slug || `#${c.id}`}</option>
            ))}
          </select>
        </label>
        <label className="form-control">
          <span className="label-text">{t('Min price') || (lang==='ar'?'السعر الأدنى':'Min price')}</span>
          <input name="minPrice" type="number" min="0" className="input input-bordered" defaultValue={sp.get('minPrice')||''} />
        </label>
        <label className="form-control">
          <span className="label-text">{t('Max price') || (lang==='ar'?'السعر الأقصى':'Max price')}</span>
          <input name="maxPrice" type="number" min="0" className="input input-bordered" defaultValue={sp.get('maxPrice')||''} />
        </label>
        <label className="form-control">
          <span className="label-text">{t('Condition') || (lang==='ar'?'الحالة':'Condition')}</span>
          <select name="condition" className="select select-bordered" defaultValue={sp.get('condition')||''}>
            <option value="">—</option>
            {CONDITIONS.map(v => <option key={v} value={v}>{t(v) || v}</option>)}
          </select>
        </label>
        <label className="form-control">
          <span className="label-text">{t('Sort') || (lang==='ar'?'ترتيب':'Sort')}</span>
          <select name="sort" className="select select-bordered" defaultValue={sp.get('sort')||''}>
            <option value="">—</option>
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </label>
        {/* Category-specific filters with More toggle */}
        {(() => {
          const queryCid = sp.get('categoryId');
          const cid = selCatId || queryCid;
          const cat = cid ? cats.find(c => String(c.id) === String(cid)) : null;
          const fields = cat?.metadata?.filters?.fields || [];
          let attrsQS = {};
          try { attrsQS = JSON.parse(sp.get('attrs') || '{}'); } catch {}
          // If user changed category locally without applying, clear previous attrs rendering
          if (selCatId && selCatId !== queryCid) attrsQS = {};
          const primary = fields.slice(0, 3);
          const more = fields.slice(3);
          return (
            <>
              {primary.map(field => (
                <label key={field.key} className="form-control">
                  <span className="label-text">{t(field.label) || field.label || field.key}</span>
                  {field.type === 'select' ? (
                    <select name={`attr.${field.key}`} className="select select-bordered" defaultValue={attrsQS[field.key] || ''}>
                      <option value="">—</option>
                      {(field.options || []).map(opt => <option key={opt} value={opt}>{t(opt) || opt}</option>)}
                    </select>
                  ) : (
                    <input name={`attr.${field.key}`} className="input input-bordered" type={field.type==='number'?'number':'text'} defaultValue={attrsQS[field.key] || ''} />
                  )}
                </label>
              ))}
              {more.length > 0 && (
                <div className="sm:col-span-2 md:col-span-4 lg:col-span-6">
              <button type="button" className="btn btn-outline btn-sm" onClick={()=>setShowMoreAttrs(v=>!v)}>
                    {showMoreAttrs ? (t('Hide more') || (lang==='ar'?'إخفاء المزيد':'Hide more')) : (t('More filters') || (lang==='ar'?'المزيد من الفلاتر':'More filters'))}
                  </button>
                </div>
              )}
              {showMoreAttrs && more.map(field => (
                <label key={field.key} className="form-control">
                  <span className="label-text">{t(field.label) || field.label || field.key}</span>
                  {field.type === 'select' ? (
                    <select name={`attr.${field.key}`} className="select select-bordered" defaultValue={attrsQS[field.key] || ''}>
                      <option value="">—</option>
                      {(field.options || []).map(opt => <option key={opt} value={opt}>{t(opt) || opt}</option>)}
                    </select>
                  ) : (
                    <input name={`attr.${field.key}`} className="input input-bordered" type={field.type==='number'?'number':'text'} defaultValue={attrsQS[field.key] || ''} />
                  )}
                </label>
              ))}
            </>
          );
        })()}
        <div className="sm:col-span-2 md:col-span-4 lg:col-span-6 text-right flex gap-2 justify-end">
          <button type="button" className="btn btn-ghost" onClick={()=>{
            const keep = new URLSearchParams(); // clear all
            setSp(keep, { replace: false });
          }}>{t('Reset') || (lang==='ar'?'إعادة ضبط':'Reset')}</button>
          <button className="btn btn-primary">{t('Apply') || (lang==='ar'?'تطبيق':'Apply')}</button>
        </div>
      </form>
      {/* Chips */}
      {chips.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {chips.map(c => (
            <span key={c.key + c.label} className="badge badge-outline">
              {c.label}
              <button type="button" className="ml-2" onClick={()=>removeChip(c)}>×</button>
            </span>
          ))}
          <button type="button" className="btn btn-ghost btn-xs" onClick={()=>{ setSp(new URLSearchParams(), { replace:false }); }}>{t('Clear') || 'Clear'}</button>
        </div>
      )}

      {loading && <Spinner size={32} />}
      <div className={`${lang==='ar'?'flex justify-end':'flex justify-start'}`}>
        <div dir={lang==='ar' ? 'rtl' : undefined} className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 w-full">
          {rows.map((l) => (
            <Link key={l.id} to={`/listings/${l.id}`} className="card bg-base-100 border hover:shadow">
              <div className="card-body p-3">
                <div className="font-semibold truncate">{titleOf(l)}</div>
                <div className="opacity-70 text-sm">{formatMoneyMajor(l.currency, l.priceAmount)}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      {!loading && rows.length === 0 && (<div className="opacity-60 mt-6">{t('No listings') || 'No listings'}</div>)}
      {pageMeta.total > pageMeta.limit && (
        <div className={`mt-6 flex ${lang==='ar'?'justify-end':'justify-start'} items-center`}>
          <div className="join">
            <button type="button" className="btn join-item" disabled={pageMeta.page<=1} onClick={()=>{
              const next = new URLSearchParams(sp);
              const p = Math.max(1, Number(pageMeta.page)-1);
              if (p<=1) next.delete('page'); else next.set('page', String(p));
              setSp(next, { replace:false });
            }}>{t('Prev') || (lang==='ar'?'السابق':'Prev')}</button>
            {pagination.items.map((it, idx) => it==='…' ? (
              <span key={`gap-${idx}`} className="btn join-item btn-ghost">…</span>
            ) : (
              <button key={it} type="button" className={`btn join-item ${Number(it)===Number(pageMeta.page)?'btn-active':''}`} onClick={()=>{
                const next = new URLSearchParams(sp);
                if (it<=1) next.delete('page'); else next.set('page', String(it));
                setSp(next, { replace:false });
              }}>{it}</button>
            ))}
            <button type="button" className="btn join-item" disabled={pageMeta.page>=pagination.totalPages} onClick={()=>{
              const next = new URLSearchParams(sp);
              const p = Math.min(pagination.totalPages, Number(pageMeta.page)+1);
              if (p<=1) next.delete('page'); else next.set('page', String(p));
              setSp(next, { replace:false });
            }}>{t('Next') || (lang==='ar'?'التالي':'Next')}</button>
          </div>
        </div>
      )}
    </section>
  );
}

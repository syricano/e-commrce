import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axiosInstance from '@/config/axiosConfig';
import usePageTitle from '@/hooks/usePageTitle';
import { useLang } from '@/context/LangProvider';
import { errorHandler } from '@/utils';
import Spinner from '@/components/UI/Spinner.jsx';

export default function CategoryBrowse() {
  const { slug } = useParams();
  const { t, lang } = useLang();
  usePageTitle('Categories');
  const [cat, setCat] = useState({ id: null, name: '' });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        let categoryId = null;
        if (/^\d+$/.test(slug || '')) {
          categoryId = Number(slug);
        } else if (slug) {
          const trRes = await axiosInstance.get('/category-translations', { params: { slug, limit: 1 } });
          const tr = (trRes?.data?.items || trRes?.data || [])[0];
          if (tr?.categoryId) categoryId = Number(tr.categoryId);
        }
        if (!categoryId) { setRows([]); setCat({ id: null, name: '' }); return; }

        // get localized name for header
        const nameRes = await axiosInstance.get('/category-translations', { params: { categoryId, limit: 10 } }).catch(()=>({data:[]}));
        const trs = nameRes?.data?.items || nameRes?.data || [];
        const idx = {}; for (const t of trs) if (t?.locale) idx[t.locale] = t;
        const best = idx[lang] || idx.en || idx.ar || trs[0];
        setCat({ id: categoryId, name: best?.name || `#${categoryId}` });

        const listRes = await axiosInstance.get('/listings', { params: { categoryId, limit: 24 } });
        setRows(listRes?.data?.items || listRes?.data || []);
      } catch (e) { errorHandler(e, t('Failed to load category') || 'Failed to load category'); }
      finally { setLoading(false); }
    };
    run();
  }, [slug, lang]);

  const titleOf = (l) => {
    const trs = Array.isArray(l?.translations) ? l.translations : [];
    const by = {}; for (const t of trs) if (t?.locale) by[t.locale] = t;
    return by[lang]?.title || by.en?.title || by.ar?.title || trs[0]?.title || `#${l.id}`;
  };

  return (
    <section className="p-4 max-w-screen-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{cat.name || t('Categories')}</h1>
      {loading && <Spinner size={32} />}
      <div className={`${lang==='ar'?'flex justify-end':'flex justify-start'}`}>
        <div dir={lang==='ar' ? 'rtl' : undefined} className={`grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 ${lang==='ar'?'text-right justify-items-end w-fit':'text-left w-full'}`}>
          {rows.map((l) => (
            <Link key={l.id} to={`/listings/${l.id}`} className="card bg-base-100 border hover:shadow">
              <div className="card-body p-3">
                <div className="font-semibold truncate">{titleOf(l)}</div>
                <div className="opacity-70 text-sm">{l.priceAmount} {l.currency}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      {!loading && rows.length === 0 && (<div className="opacity-60 mt-6">{t('No listings') || 'No listings'}</div>)}
    </section>
  );
}

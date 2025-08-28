// client/src/components/Navbar.jsx
import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import LangSwitcher from "@/components/UI/LangSwitcher.jsx";
import CartButton from "@/components/UI/CartButton.jsx";
import AccountMenu from "@/components/UI/AccountMenu.jsx";
import ThemeToggle from "@/components/UI/ThemeToggle.jsx";
import useIsMobile from "@/hooks/useIsMobile";
import { useLang } from "@/context/LangProvider";
import SearchBar from "@/components/UI/SearchBar";
import axiosInstance from "@/config/axiosConfig";
// helper to pick best translation for a category
const pickCatTr = (trsByCat, id, lang) => trsByCat[id]?.[lang] || trsByCat[id]?.en || trsByCat[id]?.ar || trsByCat[id] && Object.values(trsByCat[id])[0] || null;

 

function DesktopBar() {
  const { t, lang } = useLang();
  const [catsOpen, setCatsOpen] = useState(false);
  const [cats, setCats] = useState([]);
  const [catTr, setCatTr] = useState({});
  const [counts, setCounts] = useState({ stores: 0, listings: 0, offers: 0 });

  useEffect(() => {
    let live = true;
    const load = async () => {
      try {
        const [cRes, tRes, sRes, lRes, oRes] = await Promise.all([
          axiosInstance.get('/categories', { params: { limit: 1000 } }),
          axiosInstance.get('/category-translations', { params: { limit: 5000 } }).catch(()=>({ data: [] })),
          axiosInstance.get('/stores', { params: { limit: 1 } }).catch(()=>({ data: { total: 0 } })),
          axiosInstance.get('/listings', { params: { limit: 1 } }).catch(()=>({ data: { total: 0 } })),
          axiosInstance.get('/offers', { params: { limit: 1 } }).catch(()=>({ data: { total: 0 } })),
        ]);
        const c = cRes?.data?.items || cRes?.data || [];
        const trs = tRes?.data?.items || tRes?.data || [];
        const idx = {};
        for (const t of trs) {
          if (!idx[t.categoryId]) idx[t.categoryId] = {};
          idx[t.categoryId][t.locale] = t;
        }
        if (live) {
          setCats(Array.isArray(c) ? c : []);
          setCatTr(idx);
          setCounts({
            stores: Number(sRes?.data?.total || 0),
            listings: Number(lRes?.data?.total || 0),
            offers: Number(oRes?.data?.total || 0),
          });
        }
      } catch {}
    };
    load();
    return () => { live = false; };
  }, []);

  const byParent = new Map();
  for (const c of cats) {
    const p = c.parentId || null;
    if (!byParent.has(p)) byParent.set(p, []);
    byParent.get(p).push(c);
  }
  for (const list of byParent.values()) list.sort((a,b)=> (a.position||0)-(b.position||0) || (a.id-b.id));
  const roots = byParent.get(null) || byParent.get(undefined) || byParent.get(0) || [];

  return (
    <div className="navbar max-w-screen-2xl mx-auto px-4" onMouseLeave={() => setCatsOpen(false)}>
      <div className="navbar-start gap-2">
        <Link to="/" className="btn btn-ghost text-xl">{t('brand')}</Link>
        <ul className="menu menu-horizontal px-2">
          <li><Link to="/">{t("home")}</Link></li>
          <li><Link to="/collections">{t("offers")}</Link></li>
          <li><Link to="/stores">{t("stores")}</Link></li>
          <li className="relative">
            <button className="btn btn-ghost btn-sm" onMouseEnter={()=>setCatsOpen(true)} onClick={()=>setCatsOpen(v=>!v)}>{t('categories')}</button>
            {catsOpen && (
              <ul className="p-2 bg-base-100 min-w-56 shadow rounded-box absolute z-50 mt-2" onMouseLeave={()=>setCatsOpen(false)}>
                {roots.map(rc => {
                  const tr = pickCatTr(catTr, rc.id, lang);
                  const ch = byParent.get(rc.id) || [];
                  return (
                    <li key={rc.id} className="py-1">
                      <Link to={`/c/${tr?.slug || rc.id}`} onClick={()=>setCatsOpen(false)} className="font-semibold">{tr?.name || `#${rc.id}`}</Link>
                      {ch.length > 0 && (
                        <ul className="pl-3 mt-1 space-y-1">
                          {ch.map(sc => {
                            const tr2 = pickCatTr(catTr, sc.id, lang);
                            return (
                              <li key={sc.id}><Link to={`/c/${tr2?.slug || sc.id}`} onClick={()=>setCatsOpen(false)}>{tr2?.name || `#${sc.id}`}</Link></li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
          {/* C2C */}
          <li><Link to="/listings">{t("listings")}</Link></li>
          <li><Link to="/account/listings/new">{t("sell")}</Link></li>
        </ul>
      </div>

      <div className="navbar-md">
        <SearchBar wide />
      </div>

      <div className="navbar-end gap-2">
        <LangSwitcher />
        <ThemeToggle />
        <CartButton />
        <AccountMenu />
      </div>
    </div>
  );
}

function MobileBar() {
  const { t, lang } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const [cats, setCats] = useState([]);
  const [catTr, setCatTr] = useState({});
  const [counts, setCounts] = useState({ stores: 0, listings: 0, offers: 0 });

  useEffect(() => {
    let live = true;
    const load = async () => {
      try {
        const [cRes, tRes, sRes, lRes, oRes] = await Promise.all([
          axiosInstance.get('/categories', { params: { limit: 1000 } }),
          axiosInstance.get('/category-translations', { params: { limit: 5000 } }).catch(()=>({ data: [] })),
          axiosInstance.get('/stores', { params: { limit: 1 } }).catch(()=>({ data: { total: 0 } })),
          axiosInstance.get('/listings', { params: { limit: 1 } }).catch(()=>({ data: { total: 0 } })),
          axiosInstance.get('/offers', { params: { limit: 1 } }).catch(()=>({ data: { total: 0 } })),
        ]);
        const c = cRes?.data?.items || cRes?.data || [];
        const trs = tRes?.data?.items || tRes?.data || [];
        const idx = {};
        for (const t of trs) {
          if (!idx[t.categoryId]) idx[t.categoryId] = {};
          idx[t.categoryId][t.locale] = t;
        }
        if (live) {
          setCats(Array.isArray(c) ? c : []);
          setCatTr(idx);
          setCounts({
            stores: Number(sRes?.data?.total || 0),
            listings: Number(lRes?.data?.total || 0),
            offers: Number(oRes?.data?.total || 0),
          });
        }
      } catch {}
    };
    load();
    return () => { live = false; };
  }, []);

  const byParent = new Map();
  for (const c of cats) {
    const p = c.parentId || null;
    if (!byParent.has(p)) byParent.set(p, []);
    byParent.get(p).push(c);
  }
  for (const list of byParent.values()) list.sort((a,b)=> (a.position||0)-(b.position||0) || (a.id-b.id));
  const roots = byParent.get(null) || byParent.get(undefined) || byParent.get(0) || [];

  return (
    <>
      <div className="navbar max-w-screen-2xl mx-auto px-4">
        <div className="navbar-start">
          <Link to="/" className="btn btn-ghost text-lg p-0">{t('brand')}</Link>
        </div>
        <div className="navbar-end gap-2">
          <CartButton />
          <AccountMenu />
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 pb-2">
        <div className="navbar">
          <SearchBar />
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 pb-2 flex items-center justify-between">
        <div
          className={`dropdown ${menuOpen ? 'dropdown-open' : ''}`}
          onMouseEnter={() => setMenuOpen(true)}
          onMouseLeave={() => { setMenuOpen(false); setCatsOpen(false); }}
          onTouchStart={() => setMenuOpen(true)}
        >
          <button
            tabIndex={0}
            className="btn btn-ghost btn-sm"
            onClick={()=>setMenuOpen(v=>!v)}
            onMouseEnter={() => setMenuOpen(true)}
            aria-label="menu"
            aria-expanded={menuOpen}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
            {t("menu") || "Menu"}
          </button>

          <ul
            tabIndex={0}
            className="menu dropdown-content mt-2 w-64 bg-base-100 p-2 shadow rounded-box z-50"
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => { setMenuOpen(false); setCatsOpen(false); }}
            onTouchStart={() => setMenuOpen(true)}
          >
            <li><Link to="/">{t("home")}</Link></li>
            <li><Link to="/collections">{t("offers")}</Link></li>
            <li><Link to="/stores">{t("stores")}</Link></li>
            <li
              onMouseEnter={() => setCatsOpen(true)}
              onMouseLeave={() => setCatsOpen(false)}
              onTouchStart={() => setCatsOpen(true)}
            >
              <button type="button" onClick={(e)=>{e.stopPropagation(); setCatsOpen(v=>!v);}}>
                {t("categories")} ▾
              </button>
              {catsOpen && (
                <ul className="p-2">
                  {roots.map(rc => {
                    const tr = pickCatTr(catTr, rc.id, lang);
                    const ch = byParent.get(rc.id) || [];
                    return (
                      <li key={rc.id} className="py-1">
                        <Link to={`/c/${tr?.slug || rc.id}`}>{tr?.name || `#${rc.id}`}</Link>
                        {ch.length > 0 && (
                          <ul className="pl-3 mt-1 space-y-1">
                            {ch.map(sc => {
                              const tr2 = pickCatTr(catTr, sc.id, lang);
                              return (
                                <li key={sc.id}><Link to={`/c/${tr2?.slug || sc.id}`}>{tr2?.name || `#${sc.id}`}</Link></li>
                              );
                            })}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
            {/* C2C */}
            <li><Link to="/listings">{t("listings")}</Link></li>
            <li><Link to="/account/listings/new">{t("sell")}</Link></li>
          </ul>
        </div>

        <div className="flex items-center gap-2">
          <LangSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </>
  );
}

function Navbar() {
  const isMobile = useIsMobile(1024);
  return (
    <>
      {isMobile ? <MobileBar /> : <DesktopBar />}
    </>
  );
}

export default Navbar;

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import LangSwitcher from "@/components/UI/LangSwitcher.jsx";
import CartButton from "@/components/UI/CartButton.jsx";
import AccountMenu from "@/components/UI/AccountMenu.jsx";
import ThemeToggle from "@/components/UI/ThemeToggle.jsx";
import useIsMobile from "@/hooks/useIsMobile";
import { useLang } from "@/context/LangProvider";
import SearchBar from "@/components/UI/SearchBar";
import axiosInstance from "@/config/axiosConfig";

// pick best translation for a given category id
const pickCatTr = (trsByCat, id, lang) =>
  trsByCat[id]?.[lang] || trsByCat[id]?.en || trsByCat[id]?.ar || (trsByCat[id] && Object.values(trsByCat[id])[0]) || null;

function DesktopBar() {
  const { t, lang } = useLang();
  const [cats, setCats] = useState([]);
  const [catTr, setCatTr] = useState({});
  const [counts, setCounts] = useState({ stores: 0, listings: 0, offers: 0 });
  const [catsOpen, setCatsOpen] = useState(false);
  const [hoverRootId, setHoverRootId] = useState(null);

  useEffect(() => {
    let alive = true;
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
        if (!alive) return;
        setCats(Array.isArray(c) ? c : []);
        setCatTr(idx);
        setCounts({
          stores: Number(sRes?.data?.total || 0),
          listings: Number(lRes?.data?.total || 0),
          offers: Number(oRes?.data?.total || 0),
        });
      } catch {}
    };
    load();
    return () => { alive = false; };
  }, []);

  // build hierarchy
  const byParent = useMemo(() => {
    const map = new Map();
    for (const c of cats) {
      const p = c.parentId || null;
      if (!map.has(p)) map.set(p, []);
      map.get(p).push(c);
    }
    for (const list of map.values()) list.sort((a,b)=> (a.position||0)-(b.position||0) || (a.id-b.id));
    return map;
  }, [cats]);
  const roots = useMemo(() => byParent.get(null) || byParent.get(undefined) || byParent.get(0) || [], [byParent]);

  // helper to read tr
  const trOf = (id) => pickCatTr(catTr, id, lang);

  return (
    <div className="navbar max-w-screen-2xl mx-auto px-4 relative z-40">
      <div className="navbar-start gap-2">
        <Link to="/" className="btn btn-ghost text-xl">{t("Free Market")}</Link>
        <ul className="menu menu-horizontal px-2">
          <li><Link to="/">{t("home")}</Link></li>
          <li><Link to="/collections">{t("offers")}</Link></li>
          <li><Link to="/stores">{t("stores")}</Link></li>
          {/* Categories dropdown with grouped children on hover */}
          <li className="relative" onMouseEnter={()=>{ setCatsOpen(true); if (!hoverRootId && roots[0]) setHoverRootId(roots[0].id); }} onMouseLeave={()=>setCatsOpen(false)}>
            <button className="btn btn-ghost btn-sm">{t("categories")}</button>
            {catsOpen && (
              <div className="absolute z-50 mt-2 bg-base-100 shadow rounded-box p-2 min-w-[600px]">
                <div className="flex">
                  {/* Roots column */}
                  <ul className="w-64 pr-2 border-r">
                    {roots.map(rc => (
                      <li key={rc.id} className={`px-2 py-1 cursor-pointer ${hoverRootId===rc.id?'bg-base-200 font-semibold':''}`} onMouseEnter={()=>setHoverRootId(rc.id)}>
                        <Link to={`/c/${trOf(rc.id)?.slug || rc.id}`}>{trOf(rc.id)?.name || `#${rc.id}`}</Link>
                      </li>
                    ))}
                  </ul>
                  {/* Children column */}
                  <div className="flex-1 pl-3">
                    <ul className="grid grid-cols-2 gap-1">
                      {(byParent.get(hoverRootId) || []).map(sc => (
                        <li key={sc.id} className="px-2 py-1">
                          <Link to={`/c/${trOf(sc.id)?.slug || sc.id}`}>{trOf(sc.id)?.name || `#${sc.id}`}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
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
    let alive = true;
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
        if (!alive) return;
        setCats(Array.isArray(c) ? c : []);
        setCatTr(idx);
        setCounts({
          stores: Number(sRes?.data?.total || 0),
          listings: Number(lRes?.data?.total || 0),
          offers: Number(oRes?.data?.total || 0),
        });
      } catch {}
    };
    load();
    return () => { alive = false; };
  }, []);

  const byParent = useMemo(() => {
    const map = new Map();
    for (const c of cats) {
      const p = c.parentId || null;
      if (!map.has(p)) map.set(p, []);
      map.get(p).push(c);
    }
    for (const list of map.values()) list.sort((a,b)=> (a.position||0)-(b.position||0) || (a.id-b.id));
    return map;
  }, [cats]);
  const roots = useMemo(() => byParent.get(null) || byParent.get(undefined) || byParent.get(0) || [], [byParent]);

  return (
    <>
      <div className="navbar max-w-screen-2xl mx-auto px-4">
        <div className="navbar-start">
          <Link to="/" className="btn btn-ghost text-lg p-0">Free Market</Link>
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
        <div className={`dropdown ${menuOpen ? 'dropdown-open' : ''}`}>
          <button
            tabIndex={0}
            className="btn btn-ghost btn-sm"
            onClick={()=>setMenuOpen(v=>!v)}
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
          >
            <li><Link to="/">{t("home")}</Link></li>
            <li><Link to="/collections">{t("offers")} {typeof counts?.offers==='number'?`(${counts.offers})`:''}</Link></li>
            <li><Link to="/stores">{t("stores")} {typeof counts?.stores==='number'?`(${counts.stores})`:''}</Link></li>
            <li>
              <button type="button" onClick={(e)=>{e.stopPropagation(); setCatsOpen(v=>!v);}}>
                {t("categories")} ▾
              </button>
              {catsOpen && (
                <ul className="p-2">
                  {roots.map(rc => {
                    const tr = pickCatTr(catTr, rc.id, lang);
                    const children = byParent.get(rc.id) || [];
                    return (
                      <li key={rc.id} className="py-1">
                        <Link to={`/c/${tr?.slug || rc.id}`}>{tr?.name || `#${rc.id}`}</Link>
                        {children.length > 0 && (
                          <ul className="pl-3 mt-1 space-y-1">
                            {children.map(sc => {
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
            <li><Link to="/listings">{t("listings")} {typeof counts?.listings==='number'?`(${counts.listings})`:''}</Link></li>
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

import { useEffect, useMemo, useRef, useState } from "react";
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
  trsByCat[id]?.[lang] ||
  trsByCat[id]?.en ||
  trsByCat[id]?.ar ||
  (trsByCat[id] && Object.values(trsByCat[id])[0]) ||
  null;

/* ===================== Desktop ===================== */
function DesktopBar() {
  const { t, lang } = useLang();
  const [cats, setCats] = useState([]);
  const [catTr, setCatTr] = useState({});
  const [catsOpen, setCatsOpen] = useState(false);
  const [hoverRootId, setHoverRootId] = useState(null);
  const menuRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const [cRes, tRes] = await Promise.all([
          axiosInstance.get("/categories", { params: { limit: 1000 } }),
          axiosInstance.get("/category-translations", { params: { limit: 5000 } }).catch(() => ({ data: [] })),
        ]);
        const c = cRes?.data?.items || cRes?.data || [];
        const trs = tRes?.data?.items || tRes?.data || [];
        const idx = {};
        for (const tr of trs) {
          if (!idx[tr.categoryId]) idx[tr.categoryId] = {};
          idx[tr.categoryId][tr.locale] = tr;
        }
        if (!alive) return;
        setCats(Array.isArray(c) ? c : []);
        setCatTr(idx);
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
  const trOf = (id) => pickCatTr(catTr, id, lang);

  useEffect(() => {
    if (!catsOpen) return;
    const onDown = (e) => {
      const m = menuRef.current;
      const b = btnRef.current;
      const target = e.target;
      if (!m) return;
      const insideMenu = m.contains(target);
      const onButton = b && b.contains(target);
      if (!insideMenu && !onButton) setCatsOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [catsOpen]);

  return (
    <>
      <div className="sticky top-0 z-40 bg-base-100/90 backdrop-blur border-b">
        <div className="navbar max-w-screen-2xl mx-auto px-4">
          <div className="navbar-start gap-2">
            <Link to="/" className="btn btn-ghost text-xl normal-case tracking-tight">Free Market</Link>
            <ul className="menu menu-horizontal px-2">
              <li><Link to="/">{t("home")}</Link></li>
              <li><Link to="/deals">{t("Deals") || "Deals"}</Link></li>
              <li><Link to="/collections">{t("Collections") || "Collections"}</Link></li>
              <li><Link to="/stores">{t("stores")}</Link></li>

              <li
                className="relative"
                onMouseEnter={() => {
                  setCatsOpen(true);
                  if (!hoverRootId && roots[0]) setHoverRootId(roots[0].id);
                }}
              >
                <button
                  ref={btnRef}
                  className="btn btn-ghost btn-sm"
                  aria-haspopup="true"
                  aria-expanded={catsOpen}
                >
                  {t("categories")}
                </button>
              </li>

              <li><Link to="/listings">{t("listings")}</Link></li>
              <li><Link to="/account/listings/new">{t("sell")}</Link></li>
            </ul>
          </div>

          <div className="flex-1 px-2">
            <div className="max-w-xl mx-auto w-full">
              <SearchBar wide />
            </div>
          </div>

          <div className="navbar-end gap-2">
            <LangSwitcher />
            <ThemeToggle />
            <CartButton />
            <AccountMenu />
          </div>
        </div>
      </div>

      {catsOpen && (
        <div
          ref={menuRef}
          className="w-full bg-base-100 border-b shadow-lg"
          onMouseLeave={() => setCatsOpen(false)}
        >
          <div className="max-w-screen-2xl mx-auto px-4 py-4 flex">
            <ul className="w-64 pr-3 border-r">
              {roots.map(rc => (
                <li
                  key={rc.id}
                  className={`px-2 py-2 cursor-pointer rounded ${hoverRootId===rc.id?'bg-base-200 font-semibold':''}`}
                  onMouseEnter={()=>setHoverRootId(rc.id)}
                >
                  <Link to={`/c/${(pickCatTr(catTr, rc.id, lang))?.slug || rc.id}`}>
                    {(pickCatTr(catTr, rc.id, lang))?.name || `#${rc.id}`}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex-1 pl-4">
              <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {(byParent.get(hoverRootId) || []).map(sc => {
                  const tr = pickCatTr(catTr, sc.id, lang);
                  return (
                    <li key={sc.id} className="px-2 py-2 rounded hover:bg-base-200">
                      <Link to={`/c/${tr?.slug || sc.id}`}>{tr?.name || `#${sc.id}`}</Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ===================== Mobile (custom panel, no dropdown) ===================== */
function MobileBar() {
  const { t, lang } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const [cats, setCats] = useState([]);
  const [catTr, setCatTr] = useState({});
  const panelRef = useRef(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const [cRes, tRes] = await Promise.all([
          axiosInstance.get("/categories", { params: { limit: 1000 } }),
          axiosInstance.get("/category-translations", { params: { limit: 5000 } }).catch(() => ({ data: [] })),
        ]);
        const c = cRes?.data?.items || cRes?.data || [];
        const trs = tRes?.data?.items || tRes?.data || [];
        const idx = {};
        for (const tr of trs) {
          if (!idx[tr.categoryId]) idx[tr.categoryId] = {};
          idx[tr.categoryId][tr.locale] = tr;
        }
        if (!alive) return;
        setCats(Array.isArray(c) ? c : []);
        setCatTr(idx);
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

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    if (menuOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <>
      <div className="sticky top-0 z-40 bg-base-100/90 backdrop-blur border-b">
        <div className="navbar max-w-screen-2xl mx-auto px-4">
          <div className="navbar-start">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { setMenuOpen(true); }}
              aria-label="open menu"
              aria-expanded={menuOpen}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
              {t("menu") || "Menu"}
            </button>
          </div>
          <div className="navbar-center">
            <Link to="/" className="btn btn-ghost text-lg p-0">Free Market</Link>
          </div>
          
          <div className="navbar-end gap-2">
            <CartButton />
            <AccountMenu />
            
          </div>
          
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 pb-2">
          <div className="mt-4 flex items-center justify-between">
              <LangSwitcher />
              <SearchBar />
              <ThemeToggle />
            </div>       
          
        </div>
      </div>

      {/* Full-screen panel */}
      {menuOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMenuOpen(false)}
          />
          {/* Panel */}
          <div
            ref={panelRef}
            className="absolute inset-y-0 left-0 w-[88%] max-w-sm bg-base-100 shadow-xl border-r p-3 overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-lg">Menu</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setMenuOpen(false)} aria-label="close">
                ✕
              </button>
            </div>

            <ul className="menu">
              <li><Link to="/" onClick={() => setMenuOpen(false)}>{t("home")}</Link></li>
              <li><Link to="/deals" onClick={() => setMenuOpen(false)}>{t("Deals") || "Deals"}</Link></li>
              <li><Link to="/collections" onClick={() => setMenuOpen(false)}>{t("Collections") || "Collections"}</Link></li>
              <li><Link to="/stores" onClick={() => setMenuOpen(false)}>{t("stores")}</Link></li>

              {/* Categories toggle */}
              <li>
                <button
                  type="button"
                  className="justify-between"
                  onClick={() => setCatsOpen(v => !v)}
                  aria-expanded={catsOpen}
                  aria-controls="mobile-cats"
                >
                  {t("categories")}
                  <span className={`transition-transform ${catsOpen ? "rotate-180" : ""}`}>▾</span>
                </button>

                {catsOpen && (
                  <ul id="mobile-cats" className="p-2 max-h-96 overflow-auto border rounded-box mt-2">
                    {roots.map((rc) => {
                      const tr = pickCatTr(catTr, rc.id, lang);
                      const children = byParent.get(rc.id) || [];
                      return (
                        <li key={rc.id} className="py-1">
                          <Link to={`/c/${tr?.slug || rc.id}`} onClick={() => setMenuOpen(false)}>
                            {tr?.name || `#${rc.id}`}
                          </Link>
                          {children.length > 0 && (
                            <ul className="pl-3 mt-1 space-y-1">
                              {children.map((sc) => {
                                const tr2 = pickCatTr(catTr, sc.id, lang);
                                return (
                                  <li key={sc.id}>
                                    <Link to={`/c/${tr2?.slug || sc.id}`} onClick={() => setMenuOpen(false)}>
                                      {tr2?.name || `#${sc.id}`}
                                    </Link>
                                  </li>
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

              <li><Link to="/listings" onClick={() => setMenuOpen(false)}>{t("listings")}</Link></li>
              <li><Link to="/account/listings/new" onClick={() => setMenuOpen(false)}>{t("sell")}</Link></li>
            </ul>            
          </div>
        </div>
      )}
    </>
  );
}

/* ===================== Switcher ===================== */
function Navbar() {
  const isMobile = useIsMobile(1024);
  return <>{isMobile ? <MobileBar /> : <DesktopBar />}</>;
}

export default Navbar;

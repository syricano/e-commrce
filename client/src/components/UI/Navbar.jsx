import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
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

  const trOf = (id) => pickCatTr(catTr, id, lang);

  return (
    <>
      <div className="navbar belsy-navbar bg-[var(--n)]/80 text-[var(--nc)] shadow-sm sticky top-0 z-50 backdrop-blur-md transition-colors duration-300">
        {/* Left: brand + main links */}
        <div className="navbar-start gap-2">
          <NavLink to="/" className="btn btn-ghost normal-case text-3xl font-serif tracking-wider ml-1">
            Free Market
          </NavLink>

          <ul className="menu menu-horizontal px-1 gap-2 hidden lg:flex">
            <li><NavLink to="/" className="nav-link">{t("home")}</NavLink></li>
            <li><NavLink to="/deals" className="nav-link">{t("Deals") || "Deals"}</NavLink></li>
            <li><NavLink to="/collections" className="nav-link">{t("Collections") || "Collections"}</NavLink></li>
            <li><NavLink to="/stores" className="nav-link">{t("stores")}</NavLink></li>

            {/* Categories hover trigger */}
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

            <li><NavLink to="/listings" className="nav-link">{t("listings")}</NavLink></li>
            <li><NavLink to="/account/listings/new" className="nav-link">{t("sell")}</NavLink></li>
          </ul>
        </div>

        {/* Center: search */}
        <div className="navbar-center hidden lg:flex">
          <div className="w-[560px] max-w-xl">
            <SearchBar wide />
          </div>
        </div>

        {/* Right: actions */}
        <div className="navbar-end gap-3 pr-4">
          <ThemeToggle />
          <LangSwitcher />
          <CartButton />
          <div className="hidden lg:flex">
            <AccountMenu />
          </div>
        </div>
      </div>

      {/* Hover mega menu */}
      {catsOpen && (
        <div
          ref={menuRef}
          className="w-full bg-[var(--n)] text-[var(--nc)] border-b border-[var(--bc)]/40 shadow-lg"
          onMouseLeave={() => setCatsOpen(false)}
        >
          <div className="max-w-screen-2xl mx-auto px-4 py-4 flex">
            {/* roots */}
            <ul className="w-64 pr-3 border-r border-[var(--bc)]/40">
              {roots.map(rc => (
                <li
                  key={rc.id}
                  className={`px-2 py-2 cursor-pointer rounded ${hoverRootId===rc.id?'bg-[var(--b2)] font-semibold':''}`}
                  onMouseEnter={()=>setHoverRootId(rc.id)}
                >
                  <Link to={`/c/${(trOf(rc.id))?.slug || rc.id}`}>
                    {(trOf(rc.id))?.name || `#${rc.id}`}
                  </Link>
                </li>
              ))}
            </ul>

            {/* children */}
            <div className="flex-1 pl-4">
              <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {(byParent.get(hoverRootId) || []).map(sc => {
                  const tr = trOf(sc.id);
                  return (
                    <li key={sc.id} className="px-2 py-2 rounded hover:bg-[var(--b2)]">
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

/* ===================== Mobile (custom panel, Belsy style) ===================== */
function MobileBar() {
  const { t, lang } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const [cats, setCats] = useState([]);
  const [catTr, setCatTr] = useState({});

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

  return (
    <>
      {/* Top bar */}
      <div className="navbar belsy-navbar bg-[var(--n)]/80 text-[var(--nc)] shadow-sm sticky top-0 z-50 backdrop-blur-md transition-colors duration-300 lg:hidden">
        <div className="navbar-start">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setMenuOpen(true)}
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
          <NavLink to="/" className="btn btn-ghost normal-case text-2xl font-serif tracking-wider">
            Free Market
          </NavLink>
        </div>
        <div className="navbar-end gap-2 pr-2">
          <CartButton />
          <AccountMenu />
        </div>
      </div>

      {/* under-bar controls */}
      <div className="lg:hidden bg-[var(--n)]/80 text-[var(--nc)] border-b border-[var(--bc)]/40">
        <div className="max-w-screen-2xl mx-auto px-4 py-2 flex items-center gap-2">
          <ThemeToggle />
          <LangSwitcher />
          <div className="flex-1"><SearchBar /></div>
        </div>
      </div>

      {/* Slide-in panel */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[88%] max-w-sm bg-[var(--n)] text-[var(--nc)] shadow-xl border-r border-[var(--bc)]/40 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-lg">Menu</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setMenuOpen(false)} aria-label="close">✕</button>
            </div>

            <ul className="menu space-y-1">
              <li><NavLink to="/" className="nav-link" onClick={() => setMenuOpen(false)}>{t("home")}</NavLink></li>
              <li><NavLink to="/deals" className="nav-link" onClick={() => setMenuOpen(false)}>{t("Deals") || "Deals"}</NavLink></li>
              <li><NavLink to="/collections" className="nav-link" onClick={() => setMenuOpen(false)}>{t("Collections") || "Collections"}</NavLink></li>
              <li><NavLink to="/stores" className="nav-link" onClick={() => setMenuOpen(false)}>{t("stores")}</NavLink></li>

              {/* Categories collapsible */}
              <li>
                <button
                  type="button"
                  className="nav-link justify-between"
                  onClick={() => setCatsOpen(v => !v)}
                  aria-expanded={catsOpen}
                  aria-controls="mobile-cats"
                >
                  {t("categories")}
                  <span className={`transition-transform ${catsOpen ? "rotate-180" : ""}`}>▾</span>
                </button>

                {catsOpen && (
                  <ul id="mobile-cats" className="p-2 max-h-96 overflow-auto border border-[var(--bc)]/40 rounded-box mt-2">
                    {roots.map((rc) => {
                      const tr = pickCatTr(catTr, rc.id, lang);
                      const children = byParent.get(rc.id) || [];
                      return (
                        <li key={rc.id} className="py-1">
                          <Link to={`/c/${tr?.slug || rc.id}`} onClick={() => setMenuOpen(false)} className="nav-link">
                            {tr?.name || `#${rc.id}`}
                          </Link>
                          {children.length > 0 && (
                            <ul className="pl-3 mt-1 space-y-1">
                              {children.map((sc) => {
                                const tr2 = pickCatTr(catTr, sc.id, lang);
                                return (
                                  <li key={sc.id}>
                                    <Link to={`/c/${tr2?.slug || sc.id}`} onClick={() => setMenuOpen(false)} className="nav-link">
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

              <li><NavLink to="/listings" className="nav-link" onClick={() => setMenuOpen(false)}>{t("listings")}</NavLink></li>
              <li><NavLink to="/account/listings/new" className="nav-link" onClick={() => setMenuOpen(false)}>{t("sell")}</NavLink></li>
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

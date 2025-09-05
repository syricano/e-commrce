import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import LangSwitcher from "@/components/UI/LangSwitcher.jsx";
import AccountMenu from "@/components/UI/AccountMenu.jsx";
import ThemeToggle from "@/components/UI/ThemeToggle.jsx";
import useIsMobile from "@/hooks/useIsMobile";
import { useLang } from "@/context/LangProvider";
import SearchBar from "@/components/UI/SearchBar";
import axiosInstance from "@/config/axiosConfig";
import useCartCount from "@/hooks/useCartCount";

const pickCatTr = (trsByCat, id, lang) =>
  trsByCat[id]?.[lang] ||
  trsByCat[id]?.en ||
  trsByCat[id]?.ar ||
  (trsByCat[id] && Object.values(trsByCat[id])[0]) ||
  null;

/* ===================== Desktop (two rows, dynamic colors) ===================== */
function DesktopBar() {
  const { t, lang } = useLang();
  const cartCount = useCartCount();
  const [cats, setCats] = useState([]);
  const [catTr, setCatTr] = useState({});
  const [catsOpen, setCatsOpen] = useState(false);
  const [hoverRootId, setHoverRootId] = useState(null);
  const closeTimerRef = useRef(null);
  const clearCloseTimer = () => { if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; } };
  const scheduleClose = (delay = 700) => { clearCloseTimer(); closeTimerRef.current = setTimeout(() => setCatsOpen(false), delay); };
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

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
      const t = triggerRef.current;
      const target = e.target;
      if (!m) return;
      const insideMenu = m.contains(target);
      const onTrigger = t && t.contains(target);
      if (!insideMenu && !onTrigger) setCatsOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [catsOpen]);

  const trOf = (id) => pickCatTr(catTr, id, lang);

  return (
    <>
      <div className="sticky top-0 z-40 bg-[var(--n)]/80 text-[var(--nc)] backdrop-blur-md border-b border-[var(--bc)] transition-colors duration-300">
        <div className="max-w-screen-2xl mx-auto px-4">
          {/* Row 1 */}
          <div className="navbar py-2">
            <div className="navbar-start">
              <Link to="/" className="btn btn-ghost text-xl normal-case tracking-tight">Free Market</Link>
            </div>
            <div className="navbar-center w-full max-w-2xl">
              <SearchBar wide />
            </div>
            <div className="navbar-end gap-2">
              <LangSwitcher />
              <ThemeToggle />        
              
              <AccountMenu />              
            </div>
            {/* Currency and cart removed from navbar */}
          </div>

          {/* Row 2 */}
          <div className="border-t border-[var(--bc)]/40 relative">
            {/* Cart toggle sits at the far end by locale */}
            <div className={`absolute top-1/2 -translate-y-1/2 ${lang==='ar' ? 'left-2' : 'right-2'}`}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => window.dispatchEvent(new CustomEvent('miniCart:toggle'))}
                aria-label={t('cart') || 'Cart'}
                title={t('cart') || 'Cart'}
              >
                🛒 {t('cart') || 'Cart'}
                {cartCount > 0 && (
                  <span className="badge badge-sm ml-2">{cartCount}</span>
                )}
              </button>
            </div>

            <ul
              className="flex flex-wrap items-center justify-center gap-2 py-2"
            >
              <li><Link to="/" className="btn btn-ghost btn-sm"> {t("home")} </Link></li>
              <li><Link to="/deals" className="btn btn-ghost btn-sm"> {t("Deals") || "Deals"} </Link></li>
              <li><Link to="/collections" className="btn btn-ghost btn-sm"> {t("Collections") || "Collections"} </Link></li>
              <li><Link to="/stores" className="btn btn-ghost btn-sm"> {t("stores")} </Link></li>

              <li
                ref={triggerRef}
                className="relative"
                onMouseEnter={() => {
                  clearCloseTimer();
                  setCatsOpen(true);
                  if (!hoverRootId && roots[0]) setHoverRootId(roots[0].id);
                }}
                onMouseLeave={() => scheduleClose(800)}
              >
                <button className="btn btn-ghost btn-sm" aria-haspopup="true" aria-expanded={catsOpen}>
                  {t("categories")}
                </button>

                {catsOpen && (
                  <div
                    ref={menuRef}
                    className={`absolute top-full mt-1 z-50 w-64 bg-[var(--n)] text-[var(--nc)] border border-[var(--bc)]/40 shadow-lg rounded-b ${lang==='ar' ? 'right-0' : 'left-0'}`}
                    onMouseEnter={clearCloseTimer}
                    onMouseLeave={() => scheduleClose(800)}
                  >
                    <ul className="max-h-96 overflow-auto py-2">
                      {roots.map(rc => (
                        <li
                          key={rc.id}
                          className={`px-3 py-2 cursor-pointer hover:bg-[var(--b2)]`}
                          onMouseEnter={()=>setHoverRootId(rc.id)}
                        >
                          <Link to={`/c/${trOf(rc.id)?.slug || rc.id}`}>
                            {trOf(rc.id)?.name || `#${rc.id}`}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>

              <li><Link to="/listings" className="btn btn-ghost btn-sm">{t("listings")}</Link></li>
              <li><Link to="/account/listings/new" className="btn btn-primary btn-sm">{t("sell")}</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* category flyout rendered within the list item above to be anchored under button */}
    </>
  );
}

/* ===================== Mobile (panel, dynamic colors) ===================== */
function MobileBar() {
  const { t, lang } = useLang();
  const cartCount = useCartCount();
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
      <div className="sticky top-0 z-40 bg-[var(--n)]/80 text-[var(--nc)] backdrop-blur-md border-b border-[var(--bc)] transition-colors duration-300">
        <div className="navbar max-w-screen-2xl mx-auto px-4">
          <div className="navbar-start">
            <AccountMenu />
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
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => window.dispatchEvent(new CustomEvent('miniCart:toggle'))}
              aria-label={t('cart') || 'Cart'}
              title={t('cart') || 'Cart'}
            >
              🛒{cartCount > 0 ? ` ${cartCount}` : ''}
            </button>
          </div>
          {/* Currency and cart removed from navbar (mobile) */}
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 pb-2">
          <div className="mt-4 flex items-center justify-between">
            <LangSwitcher />
            <SearchBar />
            <ThemeToggle />
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMenuOpen(false)}
          />
          <div
            ref={panelRef}
            className="absolute inset-y-0 left-0 w-[88%] max-w-sm bg-[var(--n)] text-[var(--nc)] shadow-xl border-r border-[var(--bc)] p-3 overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-lg">Menu</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setMenuOpen(false)} aria-label="close">✕</button>
            </div>

            <ul className="menu">
              <li><Link to="/" onClick={() => setMenuOpen(false)}>{t("home")}</Link></li>
              <li><Link to="/deals" onClick={() => setMenuOpen(false)}>{t("Deals") || "Deals"}</Link></li>
              <li><Link to="/collections" onClick={() => setMenuOpen(false)}>{t("Collections") || "Collections"}</Link></li>
              <li><Link to="/stores" onClick={() => setMenuOpen(false)}>{t("stores")}</Link></li>

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
                  <ul id="mobile-cats" className="p-2 max-h-96 overflow-auto border border-[var(--bc)]/40 rounded-box mt-2">
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

function Navbar() {
  const isMobile = useIsMobile(1024);
  return <>{isMobile ? <MobileBar /> : <DesktopBar />}</>;
}

export default Navbar;

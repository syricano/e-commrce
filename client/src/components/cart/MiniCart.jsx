import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useLang } from "@/context/LangProvider";
import {
  getCurrentCart,
  updateCartItem,
  deleteCartItem,
  setCartCurrency,
} from "@/services";

const fmtMoney = (currency, amount) => {
  const val = Number(amount || 0);
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  } catch {
    return `${val.toFixed(2)} ${currency}`;
  }
};

const clamp = (n, lo = 1, hi = 99) =>
  Math.min(hi, Math.max(lo, Number.isFinite(Number(n)) ? Number(n) : lo));

const CURRENCIES = ["EUR", "USD", "SAR", "AED", "EGP"];

export default function MiniCart({ t: tProp }) {
  const { t: tCtx, lang } = useLang();
  const t = tProp || tCtx;

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState(null); // { cart, items }
  const [busyItem, setBusyItem] = useState(null);

  const itemCount = useMemo(() => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, it) => sum + (it.quantity || 0), 0);
  }, [cart]);

  async function load() {
    setLoading(true);
    try {
      const res = await getCurrentCart();
      setCart(res?.data || res);
    } catch (e) {
      toast.error(t("Failed to load cart") || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // preload quietly so badge shows count
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // ⤵️ refresh when other parts of the app signal a cart change
  useEffect(() => {
    const onUpdate = () => load();
    window.addEventListener("cart:updated", onUpdate);
    return () => window.removeEventListener("cart:updated", onUpdate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeQty = async (row, next) => {
    const qty = clamp(next, 1, 99);
    setBusyItem(row.id);
    try {
      await updateCartItem(row.id, { quantity: qty });
      await load();
    } catch (e) {
      toast.error(t("Failed to update") || "Failed to update");
    } finally {
      setBusyItem(null);
    }
  };

  const removeRow = async (row) => {
    setBusyItem(row.id);
    try {
      await deleteCartItem(row.id);
      await load();
    } catch (e) {
      toast.error(t("Failed to remove") || "Failed to remove");
    } finally {
      setBusyItem(null);
    }
  };

  const onCurrency = async (cur) => {
    try {
      await setCartCurrency(cur);
      await load();
      toast.success(t("Currency updated") || "Currency updated");
    } catch {
      toast.error(t("Failed to change currency") || "Failed to change currency");
    }
  };

  const currency = cart?.cart?.currency || "EUR";
  const subtotal = cart?.cart?.itemsSubtotalAmount || 0;
  const total = cart?.cart?.grandTotalAmount ?? subtotal;

  const anchorLeft = (lang === 'ar');
  const btnPosClass = anchorLeft ? 'fixed top-4 left-4' : 'fixed top-4 right-4';
  const panelSideClass = anchorLeft ? 'left-0' : 'right-0';
  const panelClosedX = anchorLeft ? '-100%' : '100%';

  // External toggles from navbar or other components
  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onClose = () => setOpen(false);
    const onToggle = () => setOpen((v) => !v);
    window.addEventListener('miniCart:open', onOpen);
    window.addEventListener('miniCart:close', onClose);
    window.addEventListener('miniCart:toggle', onToggle);
    return () => {
      window.removeEventListener('miniCart:open', onOpen);
      window.removeEventListener('miniCart:close', onClose);
      window.removeEventListener('miniCart:toggle', onToggle);
    };
  }, []);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/40"
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <aside
        className={`fixed top-0 ${panelSideClass} h-full w-full sm:w-[380px] z-40 bg-[var(--n)] text-[var(--nc)] overflow-y-auto`}
        role="dialog"
        aria-label={t("Mini cart") || "Mini cart"}
        style={{ transform: open ? "translateX(0)" : `translateX(${panelClosedX})`, transition: "transform 200ms ease" }}
      >
        {/* Header */}
        <div className="p-4 border-b border-[var(--bc)]/40 flex items-center justify-between">
          <div className="font-semibold">
            {t("Your cart") || "Your cart"}
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t("Close") || "Close"}
          >
            ✕
          </button>
        </div>

        {/* Currency selector */}
        <div className="p-4 border-b border-[var(--bc)]/40 flex items-center gap-2">
          <label className="text-sm opacity-70" htmlFor="mini-currency">
            {t("Currency") || "Currency"}:
          </label>
          <select
            id="mini-currency"
            value={currency}
            onChange={(e) => onCurrency(e.target.value)}
            className="border border-[var(--bc)]/40 bg-[var(--n)] text-[var(--nc)] rounded px-2 py-1 text-sm"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          {loading ? (
            <div className="opacity-60 text-sm">
              {t("Loading…") || "Loading…"}
            </div>
          ) : !cart?.items?.length ? (
            <div className="opacity-60 text-sm">
              {t("Your cart is empty") || "Your cart is empty"}
            </div>
          ) : (
            cart.items.map((row) => {
              const title =
                row.storeOffer?.product?.name ||
                row.offer?.variant?.product?.name ||
                t("Item") || "Item";
              const img =
                row.storeOffer?.product?.media?.[0]?.url ||
                row.offer?.variant?.product?.media?.[0]?.url ||
                "";
              const unit = row.display?.unitPriceAmount ?? row.unitPriceAmount ?? 0;
              const line = row.display?.lineTotalAmount ?? unit * (row.quantity || 0);

              return (
                <div
                  key={row.id}
                  className="border border-[var(--bc)]/40 rounded p-3 flex items-start gap-3"
                >
                  <div className="w-16 h-16 bg-base-200 rounded overflow-hidden shrink-0">
                    {img ? (
                      <img src={img} alt={title} className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate" title={title}>
                      {title}
                    </div>
                    <div className="text-sm opacity-70">
                      {fmtMoney(currency, unit)}
                    </div>

                    {/* Qty controls */}
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        className="border border-[var(--bc)]/40 rounded px-2"
                        onClick={() => changeQty(row, clamp((row.quantity || 1) - 1))}
                        disabled={busyItem === row.id}
                        aria-label={t("Decrease quantity") || "Decrease quantity"}
                      >
                        −
                      </button>
                      <input
                        className="border border-[var(--bc)]/40 rounded px-2 w-14 text-center bg-[var(--n)] text-[var(--nc)]"
                        inputMode="numeric"
                        value={row.quantity || 1}
                        onChange={(e) => {
                          const v = clamp(e.target.value);
                          changeQty(row, v);
                        }}
                        disabled={busyItem === row.id}
                        aria-label={t("Quantity") || "Quantity"}
                      />
                      <button
                        type="button"
                        className="border border-[var(--bc)]/40 rounded px-2"
                        onClick={() => changeQty(row, clamp((row.quantity || 1) + 1))}
                        disabled={busyItem === row.id}
                        aria-label={t("Increase quantity") || "Increase quantity"}
                      >
                        +
                      </button>

                      <div className="ml-auto text-sm font-semibold">
                        {fmtMoney(currency, line)}
                      </div>
                    </div>

                    <div className="mt-2">
                      <button
                        type="button"
                        className="text-xs underline"
                        onClick={() => removeRow(row)}
                        disabled={busyItem === row.id}
                      >
                        {t("Remove") || "Remove"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto p-4 border-t border-[var(--bc)]/40">
          <div className="flex items-center justify-between mb-3">
            <div className="opacity-70 text-sm">{t("Subtotal") || "Subtotal"}</div>
            <div className="font-semibold">{fmtMoney(currency, subtotal)}</div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="opacity-70 text-sm">{t("Total") || "Total"}</div>
            <div className="font-semibold">{fmtMoney(currency, total)}</div>
          </div>
          <button
            type="button"
            className="w-full rounded px-4 py-2 bg-[var(--nc)] text-[var(--n)]"
            onClick={() => window.location.assign('/checkout')}
          >
            {t("Checkout") || "Checkout"}
          </button>
        </div>
      </aside>
    </>
  );
}

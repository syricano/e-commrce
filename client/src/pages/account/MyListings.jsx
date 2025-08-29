import { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/config/axiosConfig";
import { useAuth } from "@/context";
import { useLang } from "@/context/LangProvider";
import { errorHandler } from "@/utils";
import { toast } from "react-hot-toast";
import usePageTitle from '@/hooks/usePageTitle';

const ALL_STATUSES = ["active", "reserved", "sold", "draft", "expired"];
const CONDITIONS = ["new", "used", "refurbished"];

const pickTitle = (l, locale = "en") =>
  l?.translations?.find((t) => t.locale === locale)?.title ||
  l?.translations?.[0]?.title ||
  l?.title ||
  "";

const formatPrice = (amount, currency) => {
  if (amount == null) return "";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "EUR",
    }).format(amount);
  } catch {
    return `${amount} ${currency || ""}`.trim();
  }
};

const statusBadge = (s) => {
  const v = String(s || "").toLowerCase();
  if (v === "active") return "badge badge-success";
  if (v === "reserved") return "badge badge-warning";
  if (v === "sold") return "badge badge-neutral";
  if (v === "draft") return "badge";
  if (v === "expired") return "badge badge-ghost";
  return "badge";
};

const reservedCountdown = (reservedAt) => {
  if (!reservedAt) return null;
  const end = new Date(new Date(reservedAt).getTime() + 48 * 60 * 60 * 1000);
  const diff = end.getTime() - Date.now();
  if (diff <= 0) return "expired";
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  return `${hours}h ${mins}m`;
};

export default function MyListings() {
  const { user } = useAuth();
  const { lang, t } = useLang();
  usePageTitle('ManageListings');

  const [items, setItems] = useState([]);
  const [catTxs, setCatTxs] = useState([]); // category translations
  const [cats, setCats] = useState([]); // categories with metadata
  const [loading, setLoading] = useState(false);

  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");

  const [openId, setOpenId] = useState(null);
  const openItem = useMemo(
    () => items.find((x) => x.id === openId) || null,
    [items, openId]
  );

  const [edit, setEdit] = useState(null);
  const [editAttrs, setEditAttrs] = useState({});
  const isEditing = !!edit;

  // categoryId -> best name for current language (fallback en -> ar -> any)
  const catMap = useMemo(() => {
    const grouped = new Map();
    for (const t of catTxs || []) {
      const id = Number(t?.categoryId);
      if (!Number.isFinite(id)) continue;
      if (!grouped.has(id)) grouped.set(id, {});
      grouped.get(id)[t.locale] = t.name || t.slug || `#${id}`;
    }
    const m = new Map();
    for (const [id, names] of grouped.entries()) {
      const name = names[lang] || names.en || names.ar || Object.values(names)[0] || `#${id}`;
      m.set(id, name);
    }
    return m;
  }, [catTxs, lang]);

  // options for edit dropdown
  const catOptions = useMemo(() => {
    const ids = Array.from(
      new Set(
        (catTxs || [])
          .map((t) => Number(t?.categoryId))
          .filter((n) => Number.isFinite(n))
      )
    );
    return ids
      .map((id) => ({ id, name: catMap.get(id) || `#${id}` }))
      .sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }, [catTxs, catMap]);

  const editFilterFields = useMemo(() => {
    const cid = edit?.categoryId;
    const cat = cats.find(c => String(c.id) === String(cid));
    return cat?.metadata?.filters?.fields || [];
  }, [cats, edit?.categoryId]);

  /* ---------------- Load helpers ---------------- */

  const fetchMine = async () => {
    const params = {
      limit: 100,
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    };
    const r = await axiosInstance.get("/listings/mine", { params });
    const xs = r?.data?.items || r?.data || [];
    const rows = Array.isArray(xs) ? xs : [];
    rows.sort((a, b) => {
      const da = new Date(a.createdAt || 0).getTime();
      const db = new Date(b.createdAt || 0).getTime();
      return db - da || (b.id ?? 0) - (a.id ?? 0);
    });
    return rows;
  };

  const load = async () => {
    setLoading(true);
    try {
      const rows = await fetchMine();
      setItems(rows);
    } catch (e) {
      errorHandler(e, "Failed to load your listings");
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryTranslations = async () => {
    try {
      const [trRes, cRes] = await Promise.all([
        axiosInstance.get('/category-translations', { params: { limit: 1000 } }),
        axiosInstance.get('/categories', { params: { limit: 1000 } }),
      ]);
      setCatTxs(trRes?.data?.items || trRes?.data || []);
      setCats(cRes?.data?.items || cRes?.data || []);
    } catch {
      // non-blocking
    }
  };

  useEffect(() => {
    load();
    loadCategoryTranslations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, statusFilter]);

  /* ---------------- Actions ---------------- */

  const onDelete = async (l) => {
    if (!confirm(`Delete listing #${l.id}? This cannot be undone.`)) return;
    try {
      await axiosInstance.delete(`/listings/${l.id}`);
      toast.success("Listing deleted");
      setItems((s) => s.filter((x) => x.id !== l.id));
      if (openId === l.id) setOpenId(null);
    } catch (e) {
      errorHandler(e, "Delete failed");
    }
  };

  const beginEdit = (l) => {
    setEdit({
      id: l.id,
      categoryId: l.categoryId ?? "",
      priceAmount: l.priceAmount ?? l.price ?? "",
      currency: l.currency ?? l.priceCurrency ?? "EUR",
      negotiable: !!l.negotiable,
      condition: l.condition || "used",
      status: (l.status || "active").toLowerCase(),
      country: l.country || "",
      city: l.locationCity || "",
    });
    setEditAttrs(l.metadata || {});
  };

  const saveEdit = async () => {
    if (!edit) return;
    const { id, ...raw } = edit;

    const patch = {};
    if (raw.categoryId !== "" && raw.categoryId != null)
      patch.categoryId = Number(raw.categoryId);
    if (raw.priceAmount !== "" && raw.priceAmount != null)
      patch.priceAmount = Number(raw.priceAmount);
    if (raw.currency) patch.currency = (raw.currency || "EUR").toUpperCase();
    if (typeof raw.negotiable === "boolean") patch.negotiable = !!raw.negotiable;
    if (raw.condition) patch.condition = raw.condition;
    if (raw.status) patch.status = raw.status;
    if (raw.city) patch.locationCity = raw.city;
    if (raw.country) patch.country = raw.country;
    if (editAttrs && Object.keys(editAttrs).length) patch.metadata = editAttrs;

    try {
      setItems((s) =>
        s.map((it) =>
          it.id === id ? { ...it, ...patch, status: patch.status || it.status } : it
        )
      );

      await axiosInstance.put(`/listings/${id}`, patch);
      toast.success("Listing updated");
      setEdit(null);

      const rows = await fetchMine();
      setItems(rows);
    } catch (e) {
      errorHandler(e, "Update failed");
      await load();
    }
  };

  /* ---------------- Derived ---------------- */

  const filtered = useMemo(() => {
    let rows = items;

    if (statusFilter !== "all") {
      rows = rows.filter(
        (x) => ((x.status || "active") + "").toLowerCase() === statusFilter
      );
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      rows = rows.filter((l) => {
        const t =
          pickTitle(l).toLowerCase() ||
          l.slug?.toLowerCase() ||
          String(l.id || "").toLowerCase();
        return t.includes(q);
      });
    }

    return rows;
  }, [items, statusFilter, query]);

  const catLabel = (id) => {
    if (id == null) return "—";
    const key = Number(id);
    return catMap.get(key) || "—";
  };

  /* ---------------- UI ---------------- */

  return (
    <section className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">{t('ManageListings')}</h1>
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>
            {loading ? "…" : "Refresh"}
          </button>
          <a className="btn btn-primary btn-sm" href="/account/listings/new">
            Create
          </a>
        </div>
      </div>

      <div className="flex items-end gap-2 flex-wrap">
        <label className="form-control min-w-64">
          <span className="label-text">Search</span>
          <input
            className="input input-bordered"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="title, slug, id…"
          />
        </label>

        <div className="join">
          {["all", ...ALL_STATUSES].map((s) => (
            <button
              key={s}
              type="button"
              className={`btn btn-sm join-item ${statusFilter === s ? "btn-active" : ""}`}
              onClick={() => setStatusFilter(s)}
              title={s === "all" ? "All statuses" : s}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th className="w-16">ID</th>
              <th className="min-w-64">Title</th>
              <th className="min-w-40">Category</th>
              <th className="min-w-32">Price</th>
              <th className="min-w-28">Status</th>
              <th className="text-right w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id} className={openId === l.id ? "bg-base-200/50" : ""}>
                <td>{l.id}</td>
                <td className="whitespace-nowrap">{pickTitle(l, lang)}</td>
                <td className="whitespace-nowrap">{catLabel(l.categoryId)}</td>
                <td className="whitespace-nowrap">
                  {formatPrice(l.priceAmount ?? l.price, l.currency ?? l.priceCurrency)}
                </td>
                <td className="whitespace-nowrap">
                  <span className={statusBadge(l.status)}>{l.status || "active"}</span>
                  {String(l.status).toLowerCase() === 'reserved' && (
                    <span className="ml-2 text-xs opacity-60">{reservedCountdown(l.reservedAt)}</span>
                  )}
                </td>
                <td className="text-right space-x-2">
                  <button
                    className="btn btn-xs"
                    onClick={() => {
                      setOpenId(openId === l.id ? null : l.id);
                      setEdit(null);
                    }}
                  >
                    {openId === l.id ? "Hide" : "View details"}
                  </button>
                  <button className="btn btn-error btn-xs" onClick={() => onDelete(l)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="py-10">
                  <div className="flex flex-col items-center justify-center gap-2 opacity-70">
                    <div className="text-lg font-semibold">No listings</div>
                    <a className="btn btn-primary btn-sm" href="/account/listings/new">
                      Create your first listing
                    </a>
                  </div>
                </td>
              </tr>
            )}

            {loading && (
              <tr>
                <td colSpan={6} className="py-8">
                  <div className="flex items-center justify-center gap-2">
                    <span className="loading loading-spinner" />
                    <span>Loading…</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {openItem && (
        <div className="card bg-base-200">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h2 className="card-title">
                #{openItem.id} — {pickTitle(openItem, lang) || "(no title)"}
              </h2>
              {!isEditing ? (
                <button className="btn btn-sm" onClick={() => beginEdit(openItem)}>
                  Update
                </button>
              ) : (
                <div className="flex gap-2">
                  <button className="btn btn-primary btn-sm" onClick={saveEdit}>
                    Save
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEdit(null)}>
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {!isEditing ? (
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <div className="text-sm opacity-60">Category</div>
                  <div>{catLabel(openItem.categoryId)}</div>
                </div>
                <div>
                  <div className="text-sm opacity-60">Status</div>
                  <div>
                    <span className={statusBadge(openItem.status)}>
                      {openItem.status || "active"}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-sm opacity-60">Price</div>
                  <div>
                    {formatPrice(
                      openItem.priceAmount ?? openItem.price,
                      openItem.currency ?? openItem.priceCurrency
                    )}
                    {openItem.negotiable ? " (negotiable)" : ""}
                  </div>
                </div>
                <div>
                  <div className="text-sm opacity-60">Condition</div>
                  <div>{openItem.condition || "used"}</div>
                </div>
                <div>
                  <div className="text-sm opacity-60">Location</div>
                  <div>
                    {(openItem.country ? `${openItem.country} • ` : "") +
                      (openItem.locationCity || "—")}
                  </div>
                </div>
                <div>
                  <div className="text-sm opacity-60">Dates</div>
                  <div>
                    Created:{" "}
                    {openItem.createdAt
                      ? new Date(openItem.createdAt).toLocaleString()
                      : "—"}
                    <br />
                    Updated:{" "}
                    {openItem.updatedAt
                      ? new Date(openItem.updatedAt).toLocaleString()
                      : "—"}
                    <br />
                    Expires:{" "}
                    {openItem.expiresAt
                      ? new Date(openItem.expiresAt).toLocaleString()
                      : "—"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                <label className="form-control">
                  <span className="label-text">Category</span>
                  <select
                    className="select select-bordered"
                    value={edit.categoryId}
                    onChange={(e) =>
                      setEdit((s) => ({ ...s, categoryId: e.target.value }))
                    }
                  >
                    <option value="">— none —</option>
                    {catOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-control">
                  <span className="label-text">Status</span>
                  <select
                    className="select select-bordered"
                    value={edit.status}
                    onChange={(e) =>
                      setEdit((s) => ({ ...s, status: e.target.value }))
                    }
                  >
                    {ALL_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-control">
                  <span className="label-text">Price</span>
                  <input
                    className="input input-bordered"
                    type="number"
                    min="0"
                    value={edit.priceAmount}
                    onChange={(e) =>
                      setEdit((s) => ({ ...s, priceAmount: e.target.value }))
                    }
                  />
                </label>

                <label className="form-control">
                  <span className="label-text">Currency</span>
                  <input
                    className="input input-bordered"
                    value={edit.currency}
                    onChange={(e) =>
                      setEdit((s) => ({ ...s, currency: e.target.value }))
                    }
                  />
                </label>

                <label className="form-control">
                  <span className="label-text">Condition</span>
                  <select
                    className="select select-bordered"
                    value={edit.condition}
                    onChange={(e) =>
                      setEdit((s) => ({ ...s, condition: e.target.value }))
                    }
                  >
                    {CONDITIONS.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-control">
                  <span className="label-text">Negotiable</span>
                  <input
                    type="checkbox"
                    className="toggle"
                    checked={!!edit.negotiable}
                    onChange={(e) =>
                      setEdit((s) => ({ ...s, negotiable: e.target.checked }))
                    }
                  />
                </label>

                <label className="form-control">
                  <span className="label-text">Country</span>
                  <input
                    className="input input-bordered"
                    value={edit.country}
                    onChange={(e) =>
                      setEdit((s) => ({ ...s, country: e.target.value }))
                    }
                    placeholder="optional"
                  />
                </label>

                <label className="form-control">
                  <span className="label-text">City</span>
                  <input
                    className="input input-bordered"
                    value={edit.city}
                    onChange={(e) =>
                      setEdit((s) => ({ ...s, city: e.target.value }))
                    }
                    placeholder="optional"
                  />
                </label>
                {editFilterFields.length > 0 && (
                  <div className="md:col-span-2 grid md:grid-cols-2 gap-3">
                    {editFilterFields.map(field => (
                      <label key={field.key} className="form-control">
                        <span className="label-text">{field.label || field.key}</span>
                        {field.type === 'select' ? (
                          <select
                            className="select select-bordered"
                            value={editAttrs[field.key] || ''}
                            onChange={(e)=>setEditAttrs(s=>({ ...s, [field.key]: e.target.value }))}
                          >
                            <option value="">—</option>
                            {(field.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : (
                          <input
                            className="input input-bordered"
                            type={field.type==='number'?'number':'text'}
                            value={editAttrs[field.key] || ''}
                            onChange={(e)=>setEditAttrs(s=>({ ...s, [field.key]: e.target.value }))}
                          />
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

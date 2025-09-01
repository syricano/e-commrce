// /middleware/entityUtils.js
import { Op } from 'sequelize';

/* ---------- Slug helpers ---------- */
export const slugify = (s = '') =>
  String(s)
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

export const ensureSlug = (s = '', fallbackPrefix = 'x') => {
  const out = slugify(s);
  return out || `${fallbackPrefix}-${Date.now()}`;
};

/**
 * Ensure slug uniqueness per locale for a given Sequelize model.
 * @param {Model} Model - Sequelize model with `slug` and `locale` fields
 * @param {string} slug - desired base slug
 * @param {string} locale - locale code to scope uniqueness
 * @param {number|null} ignoreId - id to exclude when updating
 * @param {number} guard - max suffix attempts
 */
export const uniqueSlugForLocale = async (
  Model,
  slug,
  locale,
  ignoreId = null,
  guard = 50
) => {
  let base = (slug || '').trim() || `x-${Date.now()}`;
  let candidate = base;
  let suffix = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const where = { slug: candidate, locale };
    if (ignoreId) where.id = { [Op.ne]: ignoreId };
    const exists = await Model.findOne({ where });
    if (!exists) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
    if (suffix > guard) return `${base}-${Date.now()}`;
  }
};

/* ---------- Listing ownership helpers ---------- */
export const detectOwnerAttr = (Model) => {
  const attrs = Model?.rawAttributes || {};
  for (const key of ['ownerUserId', 'ownerId', 'userId']) if (attrs[key]) return key;

  const fieldToKey = new Map(Object.entries(attrs).map(([k, v]) => [v?.field || k, k]));
  for (const candidate of ['owner_user_id', 'owner_id', 'user_id']) {
    if (fieldToKey.has(candidate)) return fieldToKey.get(candidate);
  }
  return null;
};

export const isAdmin = (user) => user?.role === 'admin' || user?.role === 'staff';

export const assignOwner = (Model, obj, user) => {
  const key = detectOwnerAttr(Model) || 'ownerUserId';
  if (!obj[key] && user?.id) obj[key] = user.id;
  return key;
};

/* ---------- Patch helpers ---------- */
export const normalizeLatLngPatch = (patch, keys = ['locationLat', 'locationLng']) => {
  const out = { ...patch };
  for (const k of keys) {
    if (out[k] === '' || out[k] === undefined) out[k] = null;
  }
  return out;
};

const helpers = {
  slugify,
  ensureSlug,
  uniqueSlugForLocale,
  detectOwnerAttr,
  isAdmin,
  assignOwner,
  normalizeLatLngPatch,
};

export default helpers;

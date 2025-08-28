import CategoryTranslation from '../models/CategoryTranslation.js';
import { Op } from 'sequelize';
import { getById, deleteById } from './crudFactory.js';
import asyncHandler from '../utils/asyncHandler.js';

// Basic slugify with fallback for non-latin names (e.g., Arabic)
const baseSlugify = (s = '') =>
  String(s)
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const ensureSlug = (s = '') => {
  const out = baseSlugify(s);
  return out || '';
};

// Ensure slug uniqueness per locale by appending a numeric suffix when needed
const uniqueSlugForLocale = async (slug, locale, ignoreId = null) => {
  let candidate = slug && slug.trim();
  if (!candidate) candidate = `cat-${Date.now()}`;
  let suffix = 1;
  // Loop until we find a free slug for the given locale
  // Guard loop to avoid infinite tries
  // We also ignore the current row by id when updating
  while (true) {
    const where = { slug: candidate, locale };
    if (ignoreId) where.id = { [Op.ne]: ignoreId };
    const exists = await CategoryTranslation.findOne({ where });
    if (!exists) return candidate;
    suffix += 1;
    candidate = `${slug}-${suffix}`;
    if (suffix > 50) return `${slug}-${Date.now()}`; // last resort
  }
};

// Safer list to avoid 500s on fresh DBs with missing tables
export const listCategoryTranslations = asyncHandler(async (req, res) => {
  try {
    const { page = '1', limit = '1000', categoryId, locale, slug } = req.query;
    const p = Math.max(parseInt(page, 10) || 1, 1);
    const l = Math.min(Math.max(parseInt(limit, 10) || 1000, 1), 5000);
    const where = {};
    if (categoryId) where.categoryId = Number(categoryId);
    if (locale) where.locale = String(locale);
    if (slug) where.slug = String(slug);
    const { count, rows } = await CategoryTranslation.findAndCountAll({
      where,
      limit: l,
      offset: (p - 1) * l,
      order: [['id', 'DESC']],
    });
    res.json({ total: count, items: rows });
  } catch (e) {
    res.json({ total: 0, items: [] });
  }
});
export const getCategoryTranslation = getById(CategoryTranslation);
export const createCategoryTranslation = asyncHandler(async (req, res) => {
  try {
    const body = req.body || {};
    const locale = String(body.locale || '').trim();
    const categoryId = Number(body.categoryId);
    if (!categoryId || !locale) return res.status(400).json({ error: 'categoryId and locale are required' });

    // If translation exists for this category + locale, update instead (idempotent)
    const existing = await CategoryTranslation.findOne({ where: { categoryId, locale } });

    // Normalize/compute slug
    let rawSlug = body.slug || ensureSlug(body.name || '');
    if (!rawSlug) rawSlug = `cat-${Date.now()}`;
    const finalSlug = await uniqueSlugForLocale(rawSlug, locale, existing?.id || null);

    if (existing) {
      await existing.update({ ...body, slug: finalSlug });
      return res.status(200).json(existing);
    }

    const row = await CategoryTranslation.create({ ...body, slug: finalSlug });
    return res.status(201).json(row);
  } catch (e) {
    if (e?.name === 'SequelizeUniqueConstraintError') {
      // Attempt recovery by adjusting slug once
      try {
        const body = req.body || {};
        const locale = String(body.locale || '').trim();
        const categoryId = Number(body.categoryId);
        let rawSlug = body.slug || ensureSlug(body.name || '') || `cat-${Date.now()}`;
        const finalSlug = await uniqueSlugForLocale(rawSlug, locale, null);
        const row = await CategoryTranslation.create({ ...body, slug: finalSlug });
        return res.status(201).json(row);
      } catch (inner) {
        return res.status(409).json({ error: 'Translation already exists for locale or slug already in use' });
      }
    }
    return res.status(500).json({ error: 'Failed to create category translation' });
  }
});

export const updateCategoryTranslation = asyncHandler(async (req, res) => {
  try {
    const row = await CategoryTranslation.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    const patch = { ...(req.body || {}) };
    // normalize slug
    if (!patch.slug && patch.name) patch.slug = ensureSlug(patch.name);
    if (!patch.slug) patch.slug = row.slug; // leave as-is

    // Ensure slug uniqueness on update
    patch.slug = await uniqueSlugForLocale(patch.slug, patch.locale || row.locale, row.id);

    await row.update(patch);
    return res.json(row);
  } catch (e) {
    if (e?.name === 'SequelizeUniqueConstraintError') {
      // Try to adjust slug and update once
      try {
        const row = await CategoryTranslation.findByPk(req.params.id);
        if (!row) return res.status(404).json({ error: 'Not found' });
        const patch = { ...(req.body || {}) };
        const loc = patch.locale || row.locale;
        let candidate = patch.slug || ensureSlug(patch.name || row.name) || row.slug;
        candidate = await uniqueSlugForLocale(candidate, loc, row.id);
        await row.update({ ...patch, slug: candidate });
        return res.json(row);
      } catch (_inner) {
        return res.status(409).json({ error: 'Translation already exists for locale or slug already in use' });
      }
    }
    return res.status(500).json({ error: 'Failed to update category translation' });
  }
});
export const deleteCategoryTranslation = deleteById(CategoryTranslation);

export default { listCategoryTranslations, getCategoryTranslation, createCategoryTranslation, updateCategoryTranslation, deleteCategoryTranslation };

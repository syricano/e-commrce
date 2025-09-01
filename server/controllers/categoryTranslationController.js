import CategoryTranslation from '../models/CategoryTranslation.js';
import { Op } from 'sequelize';
import { getById, deleteById } from './crudFactory.js';
import asyncHandler from '../utils/asyncHandler.js';
import helpers, { ensureSlug, uniqueSlugForLocale } from '../middleware/entityUtils.js';

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

    const existing = await CategoryTranslation.findOne({ where: { categoryId, locale } });

    let rawSlug = body.slug || ensureSlug(body.name || '', 'cat');
    const finalSlug = await uniqueSlugForLocale(CategoryTranslation, rawSlug, locale, existing?.id || null);

    if (existing) {
      await existing.update({ ...body, slug: finalSlug });
      return res.status(200).json(existing);
    }

    const row = await CategoryTranslation.create({ ...body, slug: finalSlug });
    return res.status(201).json(row);
  } catch (e) {
    if (e?.name === 'SequelizeUniqueConstraintError') {
      try {
        const body = req.body || {};
        const locale = String(body.locale || '').trim();
        let rawSlug = body.slug || ensureSlug(body.name || '', 'cat');
        const finalSlug = await uniqueSlugForLocale(CategoryTranslation, rawSlug, locale, null);
        const row = await CategoryTranslation.create({ ...body, slug: finalSlug });
        return res.status(201).json(row);
      } catch {
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
    if (!patch.slug && patch.name) patch.slug = ensureSlug(patch.name, 'cat');
    if (!patch.slug) patch.slug = row.slug;

    patch.slug = await uniqueSlugForLocale(
      CategoryTranslation,
      patch.slug,
      patch.locale || row.locale,
      row.id
    );

    await row.update(patch);
    return res.json(row);
  } catch (e) {
    if (e?.name === 'SequelizeUniqueConstraintError') {
      try {
        const row = await CategoryTranslation.findByPk(req.params.id);
        if (!row) return res.status(404).json({ error: 'Not found' });
        const patch = { ...(req.body || {}) };
        const loc = patch.locale || row.locale;
        let candidate = patch.slug || helpers.ensureSlug(patch.name || row.name, 'cat') || row.slug;
        candidate = await uniqueSlugForLocale(CategoryTranslation, candidate, loc, row.id);
        await row.update({ ...patch, slug: candidate });
        return res.json(row);
      } catch {
        return res.status(409).json({ error: 'Translation already exists for locale or slug already in use' });
      }
    }
    return res.status(500).json({ error: 'Failed to update category translation' });
  }
});

export const deleteCategoryTranslation = deleteById(CategoryTranslation);

export default {
  listCategoryTranslations,
  getCategoryTranslation,
  createCategoryTranslation,
  updateCategoryTranslation,
  deleteCategoryTranslation,
};

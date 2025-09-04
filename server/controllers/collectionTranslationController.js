// server/controllers/collectionTranslationController.js
import CollectionTranslation from '../models/CollectionTranslation.js';
import { Op } from 'sequelize';
import { getById, deleteById } from './crudFactory.js';
import asyncHandler from '../utils/asyncHandler.js';
import helpers, { ensureSlug, uniqueSlugForLocale } from '../middleware/entityUtils.js';

/** Safe list with filters and pagination */
export const listCollectionTranslations = asyncHandler(async (req, res) => {
  try {
    const { page = '1', limit = '1000', collectionId, locale, slug } = req.query;
    const p = Math.max(parseInt(page, 10) || 1, 1);
    const l = Math.min(Math.max(parseInt(limit, 10) || 1000, 1), 5000);

    const where = {};
    if (collectionId) where.collectionId = Number(collectionId);
    if (locale) where.locale = String(locale);
    if (slug) where.slug = String(slug);

    const { count, rows } = await CollectionTranslation.findAndCountAll({
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

export const getCollectionTranslation = getById(CollectionTranslation);

/** Create or upsert per (collectionId, locale). Enforce unique slug per locale. */
export const createCollectionTranslation = asyncHandler(async (req, res) => {
  try {
    const body = req.body || {};
    const locale = String(body.locale || '').trim();
    const collectionId = Number(body.collectionId);
    if (!collectionId || !locale) {
      return res.status(400).json({ error: 'collectionId and locale are required' });
    }

    const existing = await CollectionTranslation.findOne({ where: { collectionId, locale } });

    let rawSlug = body.slug || ensureSlug(body.title || '', 'col');
    const finalSlug = await uniqueSlugForLocale(
      CollectionTranslation,
      rawSlug,
      locale,
      existing?.id || null
    );

    if (existing) {
      await existing.update({ ...body, slug: finalSlug });
      return res.status(200).json(existing);
    }

    const row = await CollectionTranslation.create({ ...body, slug: finalSlug });
    return res.status(201).json(row);
  } catch (e) {
    if (e?.name === 'SequelizeUniqueConstraintError') {
      try {
        const body = req.body || {};
        const locale = String(body.locale || '').trim();
        let rawSlug = body.slug || ensureSlug(body.title || '', 'col');
        const finalSlug = await uniqueSlugForLocale(CollectionTranslation, rawSlug, locale, null);
        const row = await CollectionTranslation.create({ ...body, slug: finalSlug });
        return res.status(201).json(row);
      } catch {
        return res
          .status(409)
          .json({ error: 'Translation already exists for locale or slug already in use' });
      }
    }
    return res.status(500).json({ error: 'Failed to create collection translation' });
  }
});

/** Update with unique slug guarantee per locale */
export const updateCollectionTranslation = asyncHandler(async (req, res) => {
  try {
    const row = await CollectionTranslation.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });

    const patch = { ...(req.body || {}) };

    if (!patch.slug && patch.title) patch.slug = ensureSlug(patch.title, 'col');
    if (!patch.slug) patch.slug = row.slug;

    patch.slug = await uniqueSlugForLocale(
      CollectionTranslation,
      patch.slug,
      patch.locale || row.locale,
      row.id
    );

    await row.update(patch);
    return res.json(row);
  } catch (e) {
    if (e?.name === 'SequelizeUniqueConstraintError') {
      try {
        const row = await CollectionTranslation.findByPk(req.params.id);
        if (!row) return res.status(404).json({ error: 'Not found' });

        const patch = { ...(req.body || {}) };
        const loc = patch.locale || row.locale;

        let candidate =
          patch.slug || helpers.ensureSlug(patch.title || row.title, 'col') || row.slug;

        candidate = await uniqueSlugForLocale(CollectionTranslation, candidate, loc, row.id);

        await row.update({ ...patch, slug: candidate });
        return res.json(row);
      } catch {
        return res
          .status(409)
          .json({ error: 'Translation already exists for locale or slug already in use' });
      }
    }
    return res.status(500).json({ error: 'Failed to update collection translation' });
  }
});

export const deleteCollectionTranslation = deleteById(CollectionTranslation);

export default {
  listCollectionTranslations,
  getCollectionTranslation,
  createCollectionTranslation,
  updateCollectionTranslation,
  deleteCollectionTranslation,
};

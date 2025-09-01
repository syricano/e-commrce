import asyncHandler from '../utils/asyncHandler.js';
import Store from '../models/Store.js';
import StoreProduct from '../models/StoreProduct.js';
import StoreProductMedia from '../models/StoreProductMedia.js';
import Category from '../models/Category.js';

const ensureOwner = async (req, storeId) => {
  const store = await Store.findByPk(storeId);
  if (!store) return { ok: false, code: 404, error: 'Store not found' };
  if (req.user?.role !== 'admin' && req.user?.role !== 'staff' && store.ownerUserId !== req.user?.id) {
    return { ok: false, code: 403, error: 'Forbidden' };
  }
  return { ok: true, store };
};

// GET /store-products?storeId=..&id=..
export const list = asyncHandler(async (req, res) => {
  const { storeId, id } = req.query;
  const where = {};
  if (storeId) where.storeId = Number(storeId);
  if (id) where.id = Number(id);

  const rows = await StoreProduct.findAll({
    where,
    order: [['id', 'DESC']],
    include: [
      { model: StoreProductMedia, as: 'media' },
      { model: Category, as: 'category', required: false },
    ],
  });
  res.json(rows);
});

// POST /store-products  (idempotent on (storeId, articleNumber))
export const create = asyncHandler(async (req, res) => {
  const {
    storeId,
    storeCategoryId,
    categoryId,
    articleNumber,
    name,
    description,
    attributes,
    stockOnHand,
  } = req.body || {};

  if (!storeId || !articleNumber || !name) {
    return res.status(400).json({ error: 'storeId, articleNumber and name required' });
  }

  const chk = await ensureOwner(req, storeId);
  if (!chk.ok) return res.status(chk.code).json({ error: chk.error });

  const normalizedSku = String(articleNumber).trim();
  const stock = Number.isFinite(Number(stockOnHand)) ? Math.max(0, Math.trunc(Number(stockOnHand))) : 0;

  // optional attribute validation against category, but ALWAYS allow base_price to pass
  let attrs = attributes || {};
  const catIdNum = categoryId ? Number(categoryId) : null;
  if (catIdNum) {
    const cat = await Category.findByPk(catIdNum);
    if (cat?.metadata?.filters?.fields && Array.isArray(cat.metadata.filters.fields)) {
      const fields = cat.metadata.filters.fields;
      const valid = {};
      for (const f of fields) {
        const val = attrs[f.key];
        if (val == null || val === '') continue;
        if (f.type === 'select' && Array.isArray(f.options) && !f.options.includes(val)) continue;
        if (f.type === 'number' && isNaN(Number(val))) continue;
        valid[f.key] = val;
      }
      // keep base_price even if not declared in fields
      if (attrs.base_price != null) {
        const bp = Number(attrs.base_price);
        if (Number.isFinite(bp) && bp >= 0) valid.base_price = Math.round(bp);
      }
      // keep variants blob if provided
      if (Array.isArray(attrs.variants)) valid.variants = attrs.variants;
      attrs = valid;
    }
  }

  const payload = {
    storeId: Number(storeId),
    storeCategoryId: storeCategoryId ? Number(storeCategoryId) : null,
    categoryId: catIdNum || null,
    articleNumber: normalizedSku,
    name: String(name).trim(),
    description: description ? String(description) : null,
    stockOnHand: stock,
    attributes: attrs,
  };

  try {
    const row = await StoreProduct.create(payload);
    return res.status(201).json(row);
  } catch (e) {
    if (e?.name === 'SequelizeUniqueConstraintError') {
      // Resolve duplicate by restoring/updating existing, including soft-deleted
      const existing = await StoreProduct.findOne({
        where: { storeId: payload.storeId, articleNumber: normalizedSku },
        paranoid: false,
      });
      if (!existing) return res.status(409).json({ error: 'SKU already exists for this store' });
      if (existing.deletedAt) await existing.restore();
      await existing.update({
        name: payload.name,
        description: payload.description,
        categoryId: payload.categoryId ?? existing.categoryId,
        storeCategoryId: payload.storeCategoryId ?? existing.storeCategoryId,
        stockOnHand: payload.stockOnHand,
        attributes: payload.attributes ?? existing.attributes,
      });
      return res.status(200).json(existing);
    }
    console.error('Create StoreProduct failed:', e);
    return res.status(500).json({ error: 'Failed to create product' });
  }
});

// POST /store-products/:id/media
export const addMedia = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const row = await StoreProduct.findByPk(id);
  if (!row) return res.status(404).json({ error: 'Not found' });

  const chk = await ensureOwner(req, row.storeId);
  if (!chk.ok) return res.status(chk.code).json({ error: chk.error });

  const { url, type, position, altText, metadata } = req.body || {};
  if (!url) return res.status(400).json({ error: 'url required' });

  const media = await StoreProductMedia.create({
    storeProductId: row.id,
    url,
    type: type || 'image',
    position: position || 0,
    altText,
    metadata,
  });
  res.status(201).json(media);
});

// PUT /store-products/:id
export const updateOne = asyncHandler(async (req, res) => {
  const row = await StoreProduct.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });

  const chk = await ensureOwner(req, row.storeId);
  if (!chk.ok) return res.status(chk.code).json({ error: chk.error });

  const patch = { ...(req.body || {}) };

  if (patch.stockOnHand != null) {
    const n = Math.trunc(Number(patch.stockOnHand));
    patch.stockOnHand = Number.isFinite(n) && n >= 0 ? n : row.stockOnHand;
  }

  // optional re-validate attributes; ALWAYS preserve/allow base_price and variants
  if (patch.categoryId != null || patch.attributes) {
    const catId = Number(patch.categoryId ?? row.categoryId ?? 0) || null;
    const src = patch.attributes ?? row.attributes ?? {};
    if (catId) {
      const cat = await Category.findByPk(catId);
      if (cat?.metadata?.filters?.fields && Array.isArray(cat.metadata.filters.fields)) {
        const fields = cat.metadata.filters.fields;
        const valid = {};
        for (const f of fields) {
          const val = src[f.key];
          if (val == null || val === '') continue;
          if (f.type === 'select' && Array.isArray(f.options) && !f.options.includes(val)) continue;
          if (f.type === 'number' && isNaN(Number(val))) continue;
          valid[f.key] = val;
        }
        if (src.base_price != null) {
          const bp = Number(src.base_price);
          if (Number.isFinite(bp) && bp >= 0) valid.base_price = Math.round(bp);
        }
        if (Array.isArray(src.variants)) valid.variants = src.variants;
        patch.attributes = valid;
      } else {
        // if no declared fields, still normalize base_price if present
        const next = { ...src };
        if (src.base_price != null) {
          const bp = Number(src.base_price);
          if (Number.isFinite(bp) && bp >= 0) next.base_price = Math.round(bp);
        }
        patch.attributes = next;
      }
    } else {
      const next = { ...src };
      if (src.base_price != null) {
        const bp = Number(src.base_price);
        if (Number.isFinite(bp) && bp >= 0) next.base_price = Math.round(bp);
      }
      patch.attributes = next;
    }
  }

  await row.update(patch);
  res.json(row);
});

// DELETE /store-products/:id
export const removeOne = asyncHandler(async (req, res) => {
  const row = await StoreProduct.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });

  const chk = await ensureOwner(req, row.storeId);
  if (!chk.ok) return res.status(chk.code).json({ error: chk.error });

  await row.destroy();
  res.status(204).end();
});

// DELETE /store-products/:id/media/:mediaId
export const removeMedia = asyncHandler(async (req, res) => {
  const row = await StoreProduct.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });

  const chk = await ensureOwner(req, row.storeId);
  if (!chk.ok) return res.status(chk.code).json({ error: chk.error });

  const media = await StoreProductMedia.findByPk(req.params.mediaId);
  if (!media || media.storeProductId !== row.id) return res.status(404).json({ error: 'Media not found' });

  await media.destroy();
  res.status(204).end();
});

export default { list, create, addMedia, updateOne, removeOne, removeMedia };

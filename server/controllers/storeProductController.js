import asyncHandler from '../utils/asyncHandler.js';
import Store from '../models/Store.js';
import StoreProduct from '../models/StoreProduct.js';
import StoreProductMedia from '../models/StoreProductMedia.js';
import Category from '../models/Category.js';

const ensureOwner = async (req, storeId) => {
  const store = await Store.findByPk(storeId);
  if (!store) return { ok:false, code:404, error:'Store not found' };
  if (req.user?.role !== 'admin' && req.user?.role !== 'staff' && store.ownerUserId !== req.user?.id) {
    return { ok:false, code:403, error:'Forbidden' };
  }
  return { ok:true, store };
};

export const list = asyncHandler(async (req, res) => {
  const { storeId } = req.query;
  if (!storeId) return res.status(400).json({ error: 'storeId required' });
  const rows = await StoreProduct.findAll({ where: { storeId }, order: [['id','DESC']], include: [
    { model: StoreProductMedia, as: 'media' },
    { model: Category, as: 'category', required: false },
  ] });
  res.json(rows);
});

export const create = asyncHandler(async (req, res) => {
  const { storeId, storeCategoryId, categoryId, articleNumber, name, description, attributes } = req.body || {};
  if (!storeId || !articleNumber || !name) return res.status(400).json({ error: 'storeId, articleNumber and name required' });
  const chk = await ensureOwner(req, storeId);
  if (!chk.ok) return res.status(chk.code).json({ error: chk.error });
  // Optional attribute validation against global category fields
  let attrs = attributes || {};
  if (categoryId) {
    const cat = await Category.findByPk(categoryId);
    if (cat?.metadata?.filters?.fields && Array.isArray(cat.metadata.filters.fields)) {
      const fields = cat.metadata.filters.fields;
      const valid = {};
      for (const f of fields) {
        const val = attrs[f.key];
        if (val == null || val === '') continue; // optional
        if (f.type === 'select' && Array.isArray(f.options) && !f.options.includes(val)) continue;
        // basic type enforcement
        if (f.type === 'number' && isNaN(Number(val))) continue;
        valid[f.key] = val;
      }
      attrs = valid;
    }
  }
  const payload = { storeId, storeCategoryId: storeCategoryId || null, categoryId: categoryId || null, articleNumber, name, description, attributes: attrs };
  const row = await StoreProduct.create(payload);
  res.status(201).json(row);
});

export const addMedia = asyncHandler(async (req, res) => {
  const { id } = req.params; // storeProductId
  const row = await StoreProduct.findByPk(id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  const chk = await ensureOwner(req, row.storeId);
  if (!chk.ok) return res.status(chk.code).json({ error: chk.error });
  const { url, type, position, altText, metadata } = req.body || {};
  if (!url) return res.status(400).json({ error: 'url required' });
  const media = await StoreProductMedia.create({ storeProductId: row.id, url, type: type || 'image', position: position || 0, altText, metadata });
  res.status(201).json(media);
});

export const updateOne = asyncHandler(async (req, res) => {
  const row = await StoreProduct.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  const chk = await ensureOwner(req, row.storeId);
  if (!chk.ok) return res.status(chk.code).json({ error: chk.error });
  await row.update(req.body || {});
  res.json(row);
});

export const removeOne = asyncHandler(async (req, res) => {
  const row = await StoreProduct.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  const chk = await ensureOwner(req, row.storeId);
  if (!chk.ok) return res.status(chk.code).json({ error: chk.error });
  await row.destroy();
  res.status(204).end();
});

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

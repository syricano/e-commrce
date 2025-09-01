// server/controllers/storeOfferController.js
import asyncHandler from '../utils/asyncHandler.js';
import Store from '../models/Store.js';
import StoreProduct from '../models/StoreProduct.js';
import StoreOffer from '../models/StoreOffer.js';
import Category from '../models/Category.js';

// ---------- PUBLIC ----------

// GET /api/store-offers/stats
export const stats = asyncHandler(async (_req, res) => {
  const total = await StoreOffer.count({ where: { isActive: true } });
  res.json({ total });
});

// GET /api/store-offers/public
export const listPublic = asyncHandler(async (req, res) => {
  const { page = '1', limit = '50', storeId, categoryId } = req.query;
  const p = Math.max(parseInt(page, 10) || 1, 1);
  const l = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);

  const includeProduct = {
    model: StoreProduct,
    as: 'product',
    required: true,
    attributes: ['id', 'name', 'articleNumber', 'attributes', 'storeId', 'categoryId'],
    include: [
      // keep this include simple; no isActive filter to avoid schema mismatches
      { model: Store, as: 'store', required: true, attributes: ['id', 'name', 'slug'] },
      { model: Category, as: 'category', required: false, attributes: ['id'] },
    ],
  };

  if (storeId) includeProduct.where = { ...(includeProduct.where || {}), storeId: Number(storeId) };
  if (categoryId) includeProduct.where = { ...(includeProduct.where || {}), categoryId: Number(categoryId) };

  const { count, rows } = await StoreOffer.findAndCountAll({
    where: { isActive: true },
    include: [includeProduct],
    order: [['id', 'DESC']],
    limit: l,
    offset: (p - 1) * l,
  });

  res.json({ total: count, items: rows });
});

// ---------- AUTHENTICATED (seller/admin) ----------

const ensureOwnerByProduct = async (req, productId) => {
  const product = await StoreProduct.findByPk(productId);
  if (!product) return { ok: false, code: 404, error: 'Product not found' };
  const store = await Store.findByPk(product.storeId);
  if (!store) return { ok: false, code: 404, error: 'Store not found' };
  if (req.user?.role !== 'admin' && req.user?.role !== 'staff' && store.ownerUserId !== req.user?.id) {
    return { ok: false, code: 403, error: 'Forbidden' };
  }
  return { ok: true, product };
};

// GET /api/store-offers
export const list = asyncHandler(async (req, res) => {
  const { storeId } = req.query;

  const includeProduct = { model: StoreProduct, as: 'product', required: true };

  if (storeId) {
    includeProduct.where = { storeId: Number(storeId) };
  } else {
    const isPrivileged = req.user?.role === 'admin' || req.user?.role === 'staff';
    if (!isPrivileged) {
      includeProduct.include = [
        { model: Store, as: 'store', where: { ownerUserId: req.user.id }, required: true },
      ];
    }
  }

  const rows = await StoreOffer.findAll({
    include: [includeProduct],
    order: [['id', 'DESC']],
  });

  res.json(rows);
});

// POST /api/store-offers
export const create = asyncHandler(async (req, res) => {
  const { storeProductId, priceAmount, currency, stockOnHand, compareAtAmount, isActive } = req.body || {};
  if (!storeProductId || priceAmount == null) {
    return res.status(400).json({ error: 'storeProductId and priceAmount required' });
  }
  const chk = await ensureOwnerByProduct(req, storeProductId);
  if (!chk.ok) return res.status(chk.code).json({ error: chk.error });

  const row = await StoreOffer.create({
    storeProductId,
    priceAmount,
    currency: currency || 'EUR',
    stockOnHand: stockOnHand || 0,
    compareAtAmount: compareAtAmount || null,
    isActive: isActive !== false,
  });

  res.status(201).json(row);
});

// PUT /api/store-offers/:id
export const updateOne = asyncHandler(async (req, res) => {
  const row = await StoreOffer.findByPk(req.params.id, {
    include: [{ model: StoreProduct, as: 'product' }],
  });
  if (!row) return res.status(404).json({ error: 'Not found' });

  const chk = await ensureOwnerByProduct(req, row.product?.id);
  if (!chk.ok) return res.status(chk.code).json({ error: chk.error });

  await row.update(req.body || {});
  res.json(row);
});

// DELETE /api/store-offers/:id
export const removeOne = asyncHandler(async (req, res) => {
  const row = await StoreOffer.findByPk(req.params.id, {
    include: [{ model: StoreProduct, as: 'product' }],
  });
  if (!row) return res.status(404).json({ error: 'Not found' });

  const chk = await ensureOwnerByProduct(req, row.product?.id);
  if (!chk.ok) return res.status(chk.code).json({ error: chk.error });

  await row.destroy();
  res.status(204).end();
});

export default { stats, listPublic, list, create, updateOne, removeOne };

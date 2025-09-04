import { Op } from 'sequelize';
import asyncHandler from '../utils/asyncHandler.js';
import Store from '../models/Store.js';
import StoreProduct from '../models/StoreProduct.js';
import StoreOffer from '../models/StoreOffer.js';
import StoreProductMedia from '../models/StoreProductMedia.js';

/* ----------------------------- PUBLIC ----------------------------- */

// GET /api/store-offers/stats
// Optional: ?storeId=&categoryId=
export const stats = asyncHandler(async (req, res) => {
  const { storeId, categoryId } = req.query;

  const includeProduct = {
    model: StoreProduct,
    as: 'product',
    required: true,
    attributes: [],
  };

  if (storeId || categoryId) includeProduct.where = {};
  if (storeId) includeProduct.where.storeId = Number(storeId);
  if (categoryId) includeProduct.where.categoryId = Number(categoryId);

  const total = await StoreOffer.count({
    where: { isActive: true },
    include: [includeProduct],
  });

  res.json({ total });
});

// GET /api/store-offers/public
// Supports: ?page=&limit=&storeId=&categoryId=&q=
export const publicIndex = asyncHandler(async (req, res) => {
  const { page = '1', limit = '50', storeId, categoryId, q } = req.query;
  const p = Math.max(parseInt(page, 10) || 1, 1);
  const l = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);

  const includeProduct = {
    model: StoreProduct,
    as: 'product',
    required: true,
    attributes: ['id', 'name', 'articleNumber', 'storeId', 'categoryId'],
    include: [
      { model: Store, as: 'store', required: true, attributes: ['id', 'name', 'slug'] },
      { model: StoreProductMedia, as: 'media', attributes: ['id', 'url', 'position', 'altText'] },
    ],
  };

  if (storeId || categoryId || q) includeProduct.where = {};
  if (storeId) includeProduct.where.storeId = Number(storeId);
  if (categoryId) includeProduct.where.categoryId = Number(categoryId);
  if (q) {
    includeProduct.where[Op.or] = [
      { name: { [Op.iLike]: `%${q}%` } },
      { articleNumber: { [Op.iLike]: `%${q}%` } },
    ];
  }

  const { count, rows } = await StoreOffer.findAndCountAll({
    where: { isActive: true },
    include: [includeProduct],
    order: [['id', 'DESC']],
    limit: l,
    offset: (p - 1) * l,
  });

  res.json({ total: count, items: rows });
});

// GET /api/store-offers/public/:id
export const publicShow = asyncHandler(async (req, res) => {
  const row = await StoreOffer.findByPk(req.params.id, {
    where: { isActive: true },
    include: [
      {
        model: StoreProduct,
        as: 'product',
        required: true,
        attributes: ['id', 'name', 'articleNumber', 'storeId', 'categoryId', 'attributes'],
        include: [
          { model: Store, as: 'store', required: true, attributes: ['id', 'name', 'slug'] },
          { model: StoreProductMedia, as: 'media', attributes: ['id', 'url', 'position', 'altText'] },
        ],
      },
    ],
  });
  if (!row || !row.isActive) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

/* ------------------------- AUTH (seller/admin) ------------------------- */

const ensureOwnerByProduct = async (req, productId) => {
  const product = await StoreProduct.findByPk(productId);
  if (!product) return { ok: false, code: 404, error: 'Product not found' };
  const store = await Store.findByPk(product.storeId);
  if (!store) return { ok: false, code: 404, error: 'Store not found' };
  const privileged = req.user?.role === 'admin' || req.user?.role === 'staff';
  if (!privileged && store.ownerUserId !== req.user?.id) {
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
    const privileged = req.user?.role === 'admin' || req.user?.role === 'staff';
    if (!privileged) {
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

export default { stats, publicIndex, publicShow, list, create, updateOne, removeOne };

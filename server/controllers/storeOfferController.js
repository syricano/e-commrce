import asyncHandler from '../utils/asyncHandler.js';
import Store from '../models/Store.js';
import StoreProduct from '../models/StoreProduct.js';
import StoreOffer from '../models/StoreOffer.js';

const ensureOwnerByProduct = async (req, productId) => {
  const product = await StoreProduct.findByPk(productId);
  if (!product) return { ok:false, code:404, error:'Product not found' };
  const store = await Store.findByPk(product.storeId);
  if (!store) return { ok:false, code:404, error:'Store not found' };
  if (req.user?.role !== 'admin' && req.user?.role !== 'staff' && store.ownerUserId !== req.user?.id) {
    return { ok:false, code:403, error:'Forbidden' };
  }
  return { ok:true, product };
};

export const list = asyncHandler(async (req, res) => {
  const { storeId } = req.query;
  const where = {};
  if (storeId) where['$product.store_id$'] = storeId;
  const rows = await StoreOffer.findAll({
    include: [{ model: StoreProduct, as: 'product', required: true }],
    where,
    order: [['id','DESC']],
  });
  res.json(rows);
});

export const create = asyncHandler(async (req, res) => {
  const { storeProductId, priceAmount, currency, stockOnHand, compareAtAmount, isActive } = req.body || {};
  if (!storeProductId || priceAmount == null) return res.status(400).json({ error: 'storeProductId and priceAmount required' });
  const chk = await ensureOwnerByProduct(req, storeProductId);
  if (!chk.ok) return res.status(chk.code).json({ error: chk.error });
  const row = await StoreOffer.create({ storeProductId, priceAmount, currency: currency || 'EUR', stockOnHand: stockOnHand || 0, compareAtAmount: compareAtAmount || null, isActive: isActive !== false });
  res.status(201).json(row);
});

export const updateOne = asyncHandler(async (req, res) => {
  const row = await StoreOffer.findByPk(req.params.id, { include: [{ model: StoreProduct, as:'product' }] });
  if (!row) return res.status(404).json({ error: 'Not found' });
  const chk = await ensureOwnerByProduct(req, row.product?.id);
  if (!chk.ok) return res.status(chk.code).json({ error: chk.error });
  await row.update(req.body || {});
  res.json(row);
});

export const removeOne = asyncHandler(async (req, res) => {
  const row = await StoreOffer.findByPk(req.params.id, { include: [{ model: StoreProduct, as:'product' }] });
  if (!row) return res.status(404).json({ error: 'Not found' });
  const chk = await ensureOwnerByProduct(req, row.product?.id);
  if (!chk.ok) return res.status(chk.code).json({ error: chk.error });
  await row.destroy();
  res.status(204).end();
});

export default { list, create, updateOne, removeOne };


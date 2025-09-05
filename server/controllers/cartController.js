// server/controllers/cartController.js
import asyncHandler from '../utils/asyncHandler.js';
import Cart from '../models/Cart.js';
import CartItem from '../models/CartItem.js';
import Offer from '../models/Offer.js';
import StoreOffer from '../models/StoreOffer.js';
import Listing from '../models/Listing.js';
import StoreProduct from '../models/StoreProduct.js';
import StoreProductMedia from '../models/StoreProductMedia.js';
import { allowedCurrencies, convertAmount } from '../utils/fx.js';
import { displayAmounts } from '../utils/pricing.js';

// legacy admin CRUD remains exported from crudFactory via default import file
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';

export const listCarts = list(Cart);
export const getCart = getById(Cart);
export const createCart = createOne(Cart);
export const updateCart = updateById(Cart);
export const deleteCart = deleteById(Cart);

// Helpers
function mapItemsForDisplay(cartCurrency, rows) {
  return rows.map((r) => {
    const baseCurrency = r.offer?.currency || r.storeOffer?.currency || r.listing?.currency || cartCurrency;
    const disp = displayAmounts({ unitAmount: r.unitPriceAmount || 0, baseCurrency, targetCurrency: cartCurrency, qty: r.quantity || 0 });
    return { ...r.toJSON(), display: disp };
  });
}

async function hydrate(cartId) {
  const cart = await Cart.findByPk(cartId);
  const rows = await CartItem.findAll({
    where: { cartId },
    order: [['id', 'ASC']],
    include: [
      { model: Offer, as: 'offer' },
      {
        model: StoreOffer,
        as: 'storeOffer',
        include: [
          {
            model: StoreProduct,
            as: 'product',
            attributes: ['id', 'name', 'articleNumber'],
            include: [
              { model: StoreProductMedia, as: 'media', attributes: ['id', 'url', 'position', 'altText'] },
            ],
          },
        ],
      },
      { model: Listing, as: 'listing' },
    ],
  });

  const items = mapItemsForDisplay(cart.currency || 'EUR', rows);
  return { cart, items };
}

// GET /api/carts/current
export const getCurrentCart = asyncHandler(async (req, res) => {
  const data = await hydrate(req.cart.id);
  res.json(data);
});

// DELETE /api/carts/current
export const clearCurrentCart = asyncHandler(async (req, res) => {
  await CartItem.destroy({ where: { cartId: req.cart.id } });
  await Cart.update(
    {
      itemsSubtotalAmount: 0,
      shippingAmount: 0,
      taxAmount: 0,
      discountAmount: 0,
      grandTotalAmount: 0,
    },
    { where: { id: req.cart.id } }
  );
  const data = await hydrate(req.cart.id);
  res.json(data);
});

// PUT /api/carts/current  { currency }
export const updateCurrentCart = asyncHandler(async (req, res) => {
  const next = String(req.body?.currency || '').toUpperCase();
  if (!allowedCurrencies.includes(next)) {
    return res.status(400).json({ error: 'Unsupported currency' });
  }

  // set and persist
  req.cart.currency = next;
  await req.cart.save();

  // recompute totals in that currency
  // totals are recomputed lazily in read paths of items, but we also persist Cart.* totals here
  const rows = await CartItem.findAll({
    where: { cartId: req.cart.id },
    include: [{ model: Offer, as: 'offer' }, { model: StoreOffer, as: 'storeOffer' }],
  });

  let itemsSubtotalAmount = 0;
  for (const r of rows) {
    const baseCurrency = r.offer?.currency || r.storeOffer?.currency || next;
    const unitInCart = convertAmount(r.unitPriceAmount || 0, baseCurrency, next);
    itemsSubtotalAmount += unitInCart * (r.quantity || 0);
  }

  await Cart.update(
    {
      currency: next,
      itemsSubtotalAmount,
      shippingAmount: 0,
      taxAmount: 0,
      discountAmount: 0,
      grandTotalAmount: itemsSubtotalAmount,
    },
    { where: { id: req.cart.id } }
  );

  const data = await hydrate(req.cart.id);
  res.json(data);
});

export default {
  listCarts,
  getCart,
  createCart,
  updateCart,
  deleteCart,
  getCurrentCart,
  clearCurrentCart,
  updateCurrentCart,
};

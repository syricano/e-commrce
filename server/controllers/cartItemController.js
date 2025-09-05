// server/controllers/cartItemController.js
import asyncHandler from '../utils/asyncHandler.js';
import Cart from '../models/Cart.js';
import CartItem from '../models/CartItem.js';
import Offer from '../models/Offer.js';
import StoreOffer from '../models/StoreOffer.js';
import StoreProduct from '../models/StoreProduct.js';
import StoreProductMedia from '../models/StoreProductMedia.js';
import { convertAmount } from '../utils/fx.js';
import { clampQuantity, priceAndStockFor, displayAmounts } from '../utils/pricing.js';
import Listing from '../models/Listing.js';



async function recalcCartTotals(cart) {
  // compute totals in cart.currency using conversion per line
  const items = await CartItem.findAll({
    where: { cartId: cart.id },
    include: [
      { model: Offer, as: 'offer' },
      { model: StoreOffer, as: 'storeOffer' },
      { model: Listing, as: 'listing' },
    ],
  });

  let itemsSubtotalAmount = 0;
  for (const r of items) {
    const baseAmount = r.unitPriceAmount || 0; // stored in the item native currency (major units)
    const baseCurrency = r.offer?.currency || r.storeOffer?.currency || r.listing?.currency || cart.currency || 'EUR';
    const unitInCartCur = convertAmount(baseAmount, baseCurrency, cart.currency || 'EUR');
    itemsSubtotalAmount += unitInCartCur * (r.quantity || 0);
  }

  const shippingAmount = 0;
  const taxAmount = 0;
  const discountAmount = 0;
  const grandTotalAmount =
    itemsSubtotalAmount + shippingAmount + taxAmount - discountAmount;

  await Cart.update(
    {
      itemsSubtotalAmount,
      shippingAmount,
      taxAmount,
      discountAmount,
      grandTotalAmount,
      currency: cart.currency || 'EUR',
    },
    { where: { id: cart.id } }
  );
}

export const listMyCartItems = asyncHandler(async (req, res) => {
  const rows = await CartItem.findAll({
    where: { cartId: req.cart.id },
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

  // attach display prices in cart currency (reuse shared util)
  const currency = req.cart.currency || 'EUR';
  const items = rows.map((r) => {
    const baseCurrency = r.offer?.currency || r.storeOffer?.currency || r.listing?.currency || currency;
    const disp = displayAmounts({
      unitAmount: r.unitPriceAmount || 0,
      baseCurrency,
      targetCurrency: currency,
      qty: r.quantity || 0,
    });
    return { ...r.toJSON(), display: disp };
  });

  res.json({ items, currency });
});

// price and stock lookups are handled in utils/pricing.js

export const addCartItem = asyncHandler(async (req, res) => {
  const { offerId, storeOfferId, listingId } = req.body || {};
  const addQty = clampQuantity(req.body?.quantity ?? 1, 1, 99);

  const price = await priceAndStockFor({ offerId, storeOfferId, listingId, buyerUserId: req.user?.id || null });
  if (!price.ok) return res.status(price.code).json({ error: price.error });

  const where = offerId != null
      ? { cartId: req.cart.id, offerId }
      : storeOfferId != null
      ? { cartId: req.cart.id, storeOfferId }
      : { cartId: req.cart.id, listingId };

  const defaults = {
    ...where,
    quantity: price.kind === 'listing' ? 1 : addQty,
    unitPriceAmount: Math.max(0, Math.round(price.amount)),
  };

  // Manual upsert with paranoid: false to handle soft-deleted rows gracefully
  let row = await CartItem.findOne({ where, paranoid: false });
  let created = false;
  if (!row) {
    try {
      row = await CartItem.create({ ...defaults });
      created = true;
    } catch (err) {
      // Handle race: someone inserted the same key concurrently
      if (err?.name === 'SequelizeUniqueConstraintError') {
        row = await CartItem.findOne({ where });
        if (!row) throw err;
        const desiredQty = price.kind === 'listing' ? 1 : clampQuantity(row.quantity + addQty, 1, 99);
        if (Number.isFinite(price.maxStock) && desiredQty > price.maxStock) {
          return res.status(400).json({ error: 'Insufficient stock' });
        }
        row.quantity = desiredQty;
        row.unitPriceAmount = Math.max(0, Math.round(price.amount));
        await row.save();
      } else {
        throw err;
      }
    }
  } else {
    // If soft-deleted, restore and treat as a fresh add
    if (row.deletedAt) {
      await row.restore();
      row.quantity = price.kind === 'listing' ? 1 : addQty;
      row.unitPriceAmount = Math.max(0, Math.round(price.amount));
      await row.save();
    } else {
      const desiredQty = price.kind === 'listing' ? 1 : clampQuantity(row.quantity + addQty, 1, 99);
      if (Number.isFinite(price.maxStock) && desiredQty > price.maxStock) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }
      row.quantity = desiredQty;
      row.unitPriceAmount = Math.max(0, Math.round(price.amount));
      await row.save();
    }
  }

  await recalcCartTotals(req.cart);

  res.status(created ? 201 : 200).json({ item: row });
});

export const updateMyCartItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  const row = await CartItem.findOne({
    where: { id, cartId: req.cart.id },
  });
  if (!row) return res.status(404).json({ error: 'Not found' });

  const price = await priceAndStockFor({
    offerId: row.offerId ?? undefined,
    storeOfferId: row.storeOfferId ?? undefined,
    listingId: row.listingId ?? undefined,
    buyerUserId: req.user?.id || null,
  });
  if (!price.ok) return res.status(price.code).json({ error: price.error });

  const nextQty = price.kind === 'listing' ? 1 : clampQuantity(quantity ?? row.quantity, 1, 99);
  if (Number.isFinite(price.maxStock) && nextQty > price.maxStock) {
    return res.status(400).json({ error: 'Insufficient stock' });
  }

  row.quantity = nextQty;
  row.unitPriceAmount = Math.max(0, Math.round(price.amount));
  await row.save();

  await recalcCartTotals(req.cart);

  res.json({ item: row });
});

export const deleteMyCartItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const row = await CartItem.findOne({ where: { id, cartId: req.cart.id } });
  if (!row) return res.status(404).json({ error: 'Not found' });

  await row.destroy();
  await recalcCartTotals(req.cart);

  res.status(204).end();
});

// ---- Aliases so any router signature works ----
export const list = listMyCartItems;
export const listCartItems = listMyCartItems;
export const create = addCartItem;
export const createCartItem = addCartItem;
export const update = updateMyCartItem;
export const updateCartItem = updateMyCartItem;
export const remove = deleteMyCartItem;
export const deleteCartItem = deleteMyCartItem;

export default {
  listMyCartItems,
  addCartItem,
  updateMyCartItem,
  deleteMyCartItem,
};

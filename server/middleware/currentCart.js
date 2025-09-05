// server/middleware/currentCart.js
import crypto from 'crypto';
import asyncHandler from '../utils/asyncHandler.js';
import Cart from '../models/Cart.js';
import CartItem from '../models/CartItem.js';
import { getRequestCurrency } from '../utils/fx.js';

const COOKIE_NAME = 'guest_token';

const cookieOpts = () => {
  const prod = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    sameSite: prod ? 'none' : 'lax',
    secure: prod,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/',
  };
};

async function mergeCarts(fromId, toId) {
  if (fromId === toId) return;
  const items = await CartItem.findAll({ where: { cartId: fromId } });
  for (const it of items) {
    const where =
      it.offerId != null
        ? { cartId: toId, offerId: it.offerId }
        : it.storeOfferId != null
        ? { cartId: toId, storeOfferId: it.storeOfferId }
        : { cartId: toId, listingId: it.listingId };
    // Manual upsert with paranoid: false to avoid unique conflicts with soft-deleted rows
    let row = await CartItem.findOne({ where, paranoid: false });
    if (!row) {
      await CartItem.create({ ...where, quantity: it.quantity, unitPriceAmount: it.unitPriceAmount });
    } else if (row.deletedAt) {
      await row.restore();
      row.quantity = it.quantity;
      row.unitPriceAmount = it.unitPriceAmount;
      await row.save();
    } else {
      row.quantity = Math.min(99, row.quantity + it.quantity);
      row.unitPriceAmount = it.unitPriceAmount; // refresh price to latest seen
      await row.save();
    }
  }
}

export const ensureCart = asyncHandler(async (req, res, next) => {
  const cookieToken = req.cookies?.[COOKIE_NAME] || null;
  const userId = req.user?.id || null;

  // Prefer a user cart if logged in
  let cart = null;
  if (userId) {
    cart = await Cart.findOne({ where: { userId }, order: [['id', 'DESC']] });
  }

  // Otherwise locate by guest token
  if (!cart && cookieToken) {
    cart = await Cart.findOne({ where: { guestToken: cookieToken } });
  }

  // Create if missing
  if (!cart) {
    const token = crypto.randomBytes(24).toString('hex');
    const initialCurrency = getRequestCurrency(req) || 'EUR';
    cart = await Cart.create({
      userId: userId || null,
      guestToken: token,
      currency: initialCurrency,
      expiresAt: userId ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    res.cookie(COOKIE_NAME, token, cookieOpts());
  } else {
    // Ensure cookie is present
    if (!cookieToken && cart.guestToken) {
      res.cookie(COOKIE_NAME, cart.guestToken, cookieOpts());
    }
    // If logged in, attach user to cart
    if (userId && !cart.userId) {
      cart.userId = userId;
      cart.expiresAt = null;
      await cart.save();
    }
    // If logged in and cookie referenced a different guest cart, merge
    if (userId && cookieToken && cart.guestToken && cart.guestToken !== cookieToken) {
      const guestCart = await Cart.findOne({ where: { guestToken: cookieToken } });
      if (guestCart && guestCart.id !== cart.id) {
        await mergeCarts(guestCart.id, cart.id);
        await guestCart.destroy();
        res.cookie(COOKIE_NAME, cart.guestToken, cookieOpts());
      }
    }
  }

  req.cart = cart;
  next();
});

export default ensureCart;

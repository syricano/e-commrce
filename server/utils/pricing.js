import Offer from '../models/Offer.js';
import Inventory from '../models/Inventory.js';
import StoreOffer from '../models/StoreOffer.js';
import StoreProduct from '../models/StoreProduct.js';
import Store from '../models/Store.js';
import Listing from '../models/Listing.js';
import { convertAmount } from './fx.js';

export const clampQuantity = (n, min = 1, max = 99) => Math.min(max, Math.max(min, Number.isFinite(+n) ? +n : min));

export async function priceAndStockFor({ offerId, storeOfferId, listingId, buyerUserId }) {
  if (offerId) {
    const offer = await Offer.findByPk(offerId, { include: [{ model: Inventory, as: 'inventory' }] });
    if (!offer) return { ok: false, code: 400, error: 'Invalid offerId' };
    const stock = Number.isFinite(Number(offer.inventory?.quantity))
      ? Math.max(0, Number(offer.inventory.quantity))
      : Infinity;
    return {
      ok: true,
      amount: Number(offer.priceAmount) || 0, // major units
      currency: offer.currency || 'EUR',
      maxStock: stock,
      kind: 'b2c',
    };
  }
  if (storeOfferId) {
    const so = await StoreOffer.findByPk(storeOfferId, { include: [{ model: StoreProduct, as: 'product' }] });
    if (!so) return { ok: false, code: 400, error: 'Invalid storeOfferId' };
    if (buyerUserId) {
      const store = await Store.findByPk(so.product?.storeId);
      if (store && store.ownerUserId === buyerUserId) return { ok: false, code: 400, error: 'You can’t buy your own products' };
    }
    const stock = Number.isFinite(Number(so.stockOnHand)) ? Math.max(0, Number(so.stockOnHand)) : Infinity;
    return {
      ok: true,
      amount: Number(so.priceAmount) || 0, // major units
      currency: so.currency || 'EUR',
      maxStock: stock,
      kind: 'store',
    };
  }
  if (listingId) {
    const listing = await Listing.findByPk(listingId);
    if (!listing) return { ok: false, code: 400, error: 'Invalid listingId' };
    if (listing.status !== 'active' || !listing.allowCheckout) return { ok: false, code: 400, error: 'Listing not available for checkout' };
    if (buyerUserId && listing.ownerUserId === buyerUserId) return { ok: false, code: 400, error: 'You can’t buy your own products' };
    return {
      ok: true,
      amount: Number(listing.priceAmount) || 0, // major units
      currency: listing.currency || 'EUR',
      maxStock: 1,
      kind: 'listing',
      listing,
    };
  }
  return { ok: false, code: 400, error: 'offerId or storeOfferId required' };
}

export function displayAmounts({ unitAmount, baseCurrency, targetCurrency, qty = 1 }) {
  const unitPriceAmount = convertAmount(unitAmount || 0, baseCurrency || 'EUR', targetCurrency || baseCurrency || 'EUR');
  return {
    currency: targetCurrency || baseCurrency || 'EUR',
    unitPriceAmount,
    lineTotalAmount: unitPriceAmount * (Number(qty) || 0),
  };
}

export default { clampQuantity, priceAndStockFor, displayAmounts };

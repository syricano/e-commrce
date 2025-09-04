import Offer from '../models/Offer.js';
import Inventory from '../models/Inventory.js';
import StoreOffer from '../models/StoreOffer.js';
import { convertMinor } from './fx.js';

export const clampQuantity = (n, min = 1, max = 99) => Math.min(max, Math.max(min, Number.isFinite(+n) ? +n : min));

export async function priceAndStockFor({ offerId, storeOfferId }) {
  if (offerId) {
    const offer = await Offer.findByPk(offerId, { include: [{ model: Inventory, as: 'inventory' }] });
    if (!offer) return { ok: false, code: 400, error: 'Invalid offerId' };
    const stock = Number.isFinite(Number(offer.inventory?.quantity))
      ? Math.max(0, Number(offer.inventory.quantity))
      : Infinity;
    return {
      ok: true,
      amount: Number(offer.priceAmount) || 0,
      currency: offer.currency || 'EUR',
      maxStock: stock,
      kind: 'b2c',
    };
  }
  if (storeOfferId) {
    const so = await StoreOffer.findByPk(storeOfferId);
    if (!so) return { ok: false, code: 400, error: 'Invalid storeOfferId' };
    const stock = Number.isFinite(Number(so.stockOnHand)) ? Math.max(0, Number(so.stockOnHand)) : Infinity;
    return {
      ok: true,
      amount: Number(so.priceAmount) || 0,
      currency: so.currency || 'EUR',
      maxStock: stock,
      kind: 'store',
    };
  }
  return { ok: false, code: 400, error: 'offerId or storeOfferId required' };
}

export function displayAmounts({ unitMinor, baseCurrency, targetCurrency, qty = 1 }) {
  const unitPriceAmount = convertMinor(unitMinor || 0, baseCurrency || 'EUR', targetCurrency || baseCurrency || 'EUR');
  return {
    currency: targetCurrency || baseCurrency || 'EUR',
    unitPriceAmount,
    lineTotalAmount: unitPriceAmount * (Number(qty) || 0),
  };
}

export default { clampQuantity, priceAndStockFor, displayAmounts };

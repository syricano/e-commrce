// server/controllers/checkoutController.js
import asyncHandler from '../utils/asyncHandler.js';
import { localeFromReq } from '../utils/i18n.js';
import { displayAmounts } from '../utils/pricing.js';
import { convertAmount } from '../utils/fx.js';
import { clampQuantity } from '../utils/pricing.js';
import Cart from '../models/Cart.js';
import CartItem from '../models/CartItem.js';
import Offer from '../models/Offer.js';
import StoreOffer from '../models/StoreOffer.js';
import StoreProduct from '../models/StoreProduct.js';
import Store from '../models/Store.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Payment from '../models/Payment.js';
import crypto from 'crypto';
import Listing from '../models/Listing.js';

function groupByStore(items) {
  const map = new Map();
  for (const row of items) {
    const storeId = row.offer?.storeId || row.storeOffer?.product?.storeId;
    if (!storeId) continue;
    if (!map.has(storeId)) map.set(storeId, []);
    map.get(storeId).push(row);
  }
  return map;
}

function genOrderNumber() {
  const d = new Date();
  const ymd = d.toISOString().slice(0,10).replace(/-/g,'');
  const rnd = Math.floor(Math.random() * 100000).toString().padStart(5,'0');
  return `ORD-${ymd}-${rnd}`;
}

export const getCheckoutOptions = asyncHandler(async (req, res) => {
  const locale = localeFromReq(req, 'ar');
  const cart = await Cart.findByPk(req.cart.id);
  const rows = await CartItem.findAll({
    where: { cartId: req.cart.id },
    order: [['id', 'ASC']],
    include: [
      { model: Offer, as: 'offer' },
      { model: StoreOffer, as: 'storeOffer', include: [{ model: StoreProduct, as: 'product', attributes: ['id','storeId','name'] }] },
      { model: Listing, as: 'listing' },
    ],
  });

  const byStore = groupByStore(rows);
  const stores = await Store.findAll({ where: { id: Array.from(byStore.keys()) } });
  const storeMap = new Map(stores.map(s => [s.id, s]));

  const shipping = [];
  const payments = [];
  for (const [sid] of byStore.entries()) {
    const s = storeMap.get(sid);
    if (!s) continue;
    shipping.push({ storeId: sid, options: s.shippingOptions || {} });
    payments.push({ storeId: sid, options: s.preferredPayments || {} });
  }

  res.json({ locale, currency: cart.currency || 'EUR', shipping, payments });
});

export const placeOrder = asyncHandler(async (req, res) => {
  // Enforce authenticated checkout. Guests may not place orders.
  if (!req.user?.id) {
    return res.status(401).json({ error: 'Unauthorized. Please sign in to checkout' });
  }
  const locale = localeFromReq(req, 'ar');
  const body = req.body || {};
  const fulfillment = body.fulfillment === 'pickup' ? 'pickup' : 'shipping';
  const note = typeof body.note === 'string' ? body.note.slice(0, 500) : null;
  const payment = body.payment || { method: 'cod' };

  const cart = await Cart.findByPk(req.cart.id);
  const cartCurrency = cart.currency || 'EUR';
  const rows = await CartItem.findAll({
    where: { cartId: req.cart.id },
    order: [['id', 'ASC']],
    include: [
      { model: Offer, as: 'offer' },
      { model: StoreOffer, as: 'storeOffer', include: [{ model: StoreProduct, as: 'product', attributes: ['id','storeId','name'] }] },
      { model: Listing, as: 'listing' },
    ],
  });
  if (rows.length === 0) return res.status(400).json({ error: 'Cart empty' });

  // Group by store to compute shipping per store
  const byStore = groupByStore(rows);
  const stores = await Store.findAll({ where: { id: Array.from(byStore.keys()) } });
  const storeMap = new Map(stores.map(s => [s.id, s]));

  // Validate fulfillment compatibility
  for (const [sid] of byStore.entries()) {
    const s = storeMap.get(sid);
    const so = s?.shippingOptions || {};
    const ok = fulfillment === 'pickup' ? so.pickupEnabled !== false : so.shippingEnabled !== false;
    if (!ok) return res.status(400).json({ error: `Store ${s?.name || sid} does not support ${fulfillment}` });
  }

  // Compute items subtotal in cart currency
  let itemsSubtotalAmount = 0;
  const itemSnapshots = [];
  for (const r of rows) {
    const baseCurrency = r.offer?.currency || r.storeOffer?.currency || r.listing?.currency || cartCurrency;
    const disp = displayAmounts({ unitAmount: r.unitPriceAmount || 0, baseCurrency, targetCurrency: cartCurrency, qty: r.quantity || 0 });
    itemsSubtotalAmount += disp.lineTotalAmount;
    const storeId = r.offer?.storeId || r.storeOffer?.product?.storeId || null;
    const title = r.storeOffer?.product?.name || r.offer?.id?.toString() || r.listing?.translations?.[0]?.title || `listing #${r.listingId || ''}`;
    itemSnapshots.push({
      offerId: r.offerId || null,
      storeOfferId: r.storeOfferId || null,
      listingId: r.listingId || null,
      storeId,
      name: title,
      unitPriceAmount: disp.unitPriceAmount,
      quantity: clampQuantity(r.quantity, 1, 999),
    });
  }

  // Compute naive shipping cost per store: pick first method of first matching zone if shipping
  let shippingAmount = 0;
  const shippingData = { fulfillment, address: null, perStore: [] };
  if (fulfillment === 'shipping') {
    // Basic address selection
    const addr = body.shippingAddress || {};
    const country = String(addr.country || '').trim();
    const city = String(addr.city || '').trim();
    if (!country || !city) return res.status(400).json({ error: 'shippingAddress with country and city is required' });
    shippingData.address = addr;
    for (const [sid, items] of byStore.entries()) {
      const s = storeMap.get(sid);
      const so = s?.shippingOptions || {};
      let best = null;
      // find first zone that includes country/city
      for (const z of Array.isArray(so.zones) ? so.zones : []) {
        const matchCountry = (z.countries || []).length === 0 || (z.countries || []).includes(country);
        const matchCity = (z.cities || []).length === 0 || (z.cities || []).some(c => String(c).toLowerCase() === city.toLowerCase());
        if (!matchCountry || !matchCity) continue;
        if (Array.isArray(z.methods) && z.methods.length > 0) { best = { zone: z, method: z.methods[0] }; break; }
      }
      // fallback: zero-cost shipping if none configured
      const method = best?.method;
      const perItemAmount = Number(method?.perItemAmount || 0);
      const flat = Number(method?.flatAmount || 0);
      const srcCur = method?.currency || cartCurrency;
      const count = items.reduce((acc, it) => acc + clampQuantity(it.quantity, 1, 999), 0);
      let cost = flat + (perItemAmount * count);
      // free threshold
      if (Number.isFinite(Number(method?.freeThresholdAmount)) && itemsSubtotalAmount >= Number(method.freeThresholdAmount)) cost = 0;
      const costInCartCur = convertAmount(cost, srcCur, cartCurrency);
      shippingAmount += costInCartCur;
      shippingData.perStore.push({ storeId: sid, zoneId: best?.zone?.id || null, methodId: method?.id || null, costAmount: costInCartCur, currency: cartCurrency });
    }
  } else {
    // pickup: optionally include selected pickup point/address
    if (body.pickupSelection) shippingData.pickup = body.pickupSelection;
  }

  const taxAmount = 0; // TBD tax logic
  const discountAmount = 0;
  const grandTotalAmount = itemsSubtotalAmount + shippingAmount + taxAmount - discountAmount;

  const order = await Order.create({
    userId: req.user.id,
    number: genOrderNumber(),
    currency: cartCurrency,
    itemsSubtotalAmount,
    shippingAmount,
    taxAmount,
    discountAmount,
    grandTotalAmount,
    paymentStatus: 'unpaid',
    fulfillmentStatus: fulfillment === 'pickup' ? 'unfulfilled' : 'unfulfilled',
    placedAt: new Date(),
    shippingData,
    paymentData: payment,
    customerNote: note,
  });

  // Create order items
  for (const it of itemSnapshots) {
    await OrderItem.create({
      orderId: order.id,
      offerId: it.offerId || undefined,
      storeOfferId: it.storeOfferId || undefined,
      listingId: it.listingId || undefined,
      storeId: it.storeId,
      productSnapshotName: it.name,
      snapshotLocale: locale,
      unitPriceAmount: it.unitPriceAmount,
      quantity: it.quantity,
      taxRatePct: 0,
    });
  }

  // Create a placeholder payment record for offline or manual methods
  if (payment && payment.method) {
    await Payment.create({
      orderId: order.id,
      provider: String(payment.method),
      transactionId: `offline-${Date.now()}`,
      status: 'authorized',
      amount: grandTotalAmount,
      currency: cartCurrency,
      rawResponse: payment,
    });
  }

  // Clear cart
  await CartItem.destroy({ where: { cartId: req.cart.id } });
  await Cart.update({ itemsSubtotalAmount: 0, shippingAmount: 0, taxAmount: 0, discountAmount: 0, grandTotalAmount: 0 }, { where: { id: req.cart.id } });

  res.status(201).json({ orderId: order.id, number: order.number, currency: cartCurrency, totals: { itemsSubtotalAmount, shippingAmount, taxAmount, discountAmount, grandTotalAmount } });
});

export default { getCheckoutOptions, placeOrder };

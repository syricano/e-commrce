import Store from '../models/Store.js';
import StoreProduct from '../models/StoreProduct.js';
import Listing from '../models/Listing.js';
import ErrorResponse from '../utils/errorResponse.js';
import { isAdmin } from '../middleware/entityUtils.js'; // you already have this helper

export async function ensureStoreOwner(req, storeId) {
  const store = await Store.findByPk(storeId);
  if (!store) throw new ErrorResponse('Store not found', 404);
  if (!isAdmin(req.user) && store.ownerUserId !== req.user?.id) throw new ErrorResponse('Forbidden', 403);
  return store;
}

export async function ensureStoreProductOwner(req, storeProductId) {
  const product = await StoreProduct.findByPk(storeProductId);
  if (!product) throw new ErrorResponse('Product not found', 404);
  await ensureStoreOwner(req, product.storeId);
  return product;
}

export async function ensureListingOwner(req, listingIdOrInstance) {
  const listing = typeof listingIdOrInstance === 'object'
    ? listingIdOrInstance
    : await Listing.findByPk(listingIdOrInstance);
  if (!listing) throw new ErrorResponse('Not found', 404);
  if (!isAdmin(req.user) && listing.ownerUserId !== req.user?.id) throw new ErrorResponse('Forbidden', 403);
  return listing;
}

/* Optional express-style middlewares */
export const requireStoreOwner = (param = 'id') => async (req, _res, next) => {
  try { await ensureStoreOwner(req, req.params[param]); next(); } catch (e) { next(e); }
};
export const requireStoreProductOwner = (param = 'id') => async (req, _res, next) => {
  try { await ensureStoreProductOwner(req, req.params[param]); next(); } catch (e) { next(e); }
};
export const requireListingOwner = (param = 'id') => async (req, _res, next) => {
  try { await ensureListingOwner(req, req.params[param]); next(); } catch (e) { next(e); }
};

export default {
  ensureStoreOwner, ensureStoreProductOwner, ensureListingOwner,
  requireStoreOwner, requireStoreProductOwner, requireListingOwner
};

import axiosInstance from '@/config/axiosConfig';
import { asyncHandler } from '@/utils';
import { createCrud } from './crudFactory';

/* ===== Auth ===== */
export const register = async (payload) => {
  const res = await asyncHandler(() => axiosInstance.post('/auth/register', payload), 'Signup failed')();
  const { token, user } = res?.data || res || {};
  return { token, user };
};

export const login = async (payload) => {
  const res = await asyncHandler(() => axiosInstance.post('/auth/login', payload), 'Login failed')();
  const { token, user } = res?.data || res || {};
  return { token, user };
};

export const logout = () =>
  asyncHandler(() => axiosInstance.post('/auth/logout'), 'Logout failed')();

export const getMe = async () => {
  const res = await axiosInstance.get('/auth/me');
  const b = res?.data ?? {};
  return b.user || b;
};
export const googleLoginUrl = () =>
  `${import.meta.env.VITE_API_BASE_URL || '/api'}/auth/google`;

/* ===== Public read-only ===== */
const categories  = createCrud('/categories');
export const Categories = createCrud('/categories');
const brands      = createCrud('/brands');
const products    = createCrud('/products');
const collections = createCrud('/collections');
export const CategoryTranslations = createCrud('/category-translations');

/* Admin CRUD for manual collection items */
export const CollectionItems = createCrud('/collection-items');

/* Public resolver */
export const getPublicCollectionItems = (key, params) =>
  asyncHandler(
    () => axiosInstance.get(`/collections/${encodeURIComponent(key)}/items`, { params }),
    'Failed to load collection items'
  )();

/* Convenience getters */
export const getAllCategories = categories.list;
export const getCategoryById  = categories.get;
export const getAllBrands     = brands.list;
export const getBrandById     = brands.get;
export const getAllProducts   = products.list;
export const getProductById   = products.get;
export const getAllCollections = collections.list;
export const getCollectionById = collections.get;

/* ===== Profile ===== */
export const getMyProfile = async () => {
  const res = await asyncHandler(() => axiosInstance.get('/profiles/me'), 'Failed to load profile')();
  return res?.data || res || null;
};
export const updateMyProfile = async (data) => {
  const res = await asyncHandler(() => axiosInstance.put('/profiles/me', data), 'Failed to update profile')();
  return res?.data || res || null;
};

/* ===== Orders ===== */
export const listMyOrders = (params) =>
  asyncHandler(() => axiosInstance.get('/orders/mine', { params }), 'Failed to load orders')();
export const getMyOrder = (id) =>
  asyncHandler(() => axiosInstance.get(`/orders/${id}/detail`), 'Failed to load order')();
// Create a new order
export const createOrder = (data) =>
  asyncHandler(() => axiosInstance.post('/orders', data), 'Failed to create order')();

// Update an existing order (admin only)
export const updateOrder = (id, data) =>
  asyncHandler(() => axiosInstance.put(`/orders/${id}`, data), 'Failed to update order')();

// Delete an order (admin only)
export const deleteOrder = (id) =>
  asyncHandler(() => axiosInstance.delete(`/orders/${id}`), 'Failed to delete order')();

// Pay an order (user or admin)
export const payMyOrder = (id) =>
  asyncHandler(() => axiosInstance.post(`/orders/${id}/pay`), 'Failed to pay order')();

// Removed guest-order claim endpoint (no guest checkout)

/* ===== Listings ===== */
const listings = createCrud('/listings');
export const searchAll = (params) =>
  asyncHandler(() => axiosInstance.get('/search', { params }), 'Search failed')();
export const getAllListings = listings.list;
export const getListingById = listings.get;
export const getMyListings  = (params) =>
  asyncHandler(() => axiosInstance.get('/listings/mine', { params }), 'Failed to load my listings')();
export const createListing  = listings.create;
export const updateListing  = listings.update;
export const deleteListing  = listings.remove;

export const toggleFavorite = (id) =>
  asyncHandler(() => axiosInstance.post(`/listings/${id}/favorite`), 'Failed to toggle favorite')();

/* ===== Listing Offers ===== */
const listingOffers = createCrud('/listing-offers');
export const createListingOffer = listingOffers.create;
export const updateListingOffer = listingOffers.update;
export const deleteListingOffer = listingOffers.remove;
export const getListingOffer    = listingOffers.get;
export const acceptListingOffer = (id, method) =>
  asyncHandler(() => axiosInstance.post(`/listing-offers/${id}/accept`, { method }), 'Failed to accept offer')();
export const declineListingOffer = (id) =>
  asyncHandler(() => axiosInstance.post(`/listing-offers/${id}/decline`), 'Failed to decline offer')();

/* ===== Messaging ===== */
export const listThreads = (params) =>
  asyncHandler(() => axiosInstance.get('/threads', { params }), 'Failed to fetch threads')();
export const createThread = (data) =>
  asyncHandler(() => axiosInstance.post('/threads', data), 'Failed to create thread')();
export const sendMessage = (threadId, body) =>
  asyncHandler(() => axiosInstance.post(`/threads/${threadId}/messages`, body), 'Failed to send message')();
export const listThreadMessages = (threadId) =>
  asyncHandler(() => axiosInstance.get(`/threads/${threadId}/messages`), 'Failed to load messages')();

/* ===== Reports ===== */
export const reportListing = (payload) =>
  asyncHandler(() => axiosInstance.post('/reports', payload), 'Failed to submit report')();

/* ===== Transactions ===== */
export const listMyTransactions = (params) =>
  asyncHandler(() => axiosInstance.get('/transactions/mine', { params }), 'Failed to load transactions')();
export const getTransaction = (id) =>
  asyncHandler(() => axiosInstance.get(`/transactions/${id}`), 'Failed to load transaction')();

/* ===== CART ===== */
export const getCurrentCart = () =>
  asyncHandler(() => axiosInstance.get('/carts/current'), 'Failed to load cart')();
export const clearCurrentCart = () =>
  asyncHandler(() => axiosInstance.delete('/carts/current'), 'Failed to clear cart')();
export const setCartCurrency = (currency) =>
  asyncHandler(() => axiosInstance.put('/carts/current', { currency }), 'Failed to change currency')();
export const listCartItems = (params) =>
  asyncHandler(() => axiosInstance.get('/cart-items', { params }), 'Failed to load cart items')();

/** Post both naming styles so either server variant accepts it */
export const addCartItem = ({ offerId, storeOfferId, listingId, quantity }) =>
  asyncHandler(() => {
    const q = Math.max(1, Math.min(99, Number(quantity) || 1));
    const body = { quantity: q };

    if (offerId != null) {
      const v = Number(offerId);
      body.offerId = v;
      body.offer_id = v;             // snake_case fallback
    }
    if (storeOfferId != null) {
      const v = Number(storeOfferId);
      body.storeOfferId = v;
      body.store_offer_id = v;       // snake_case fallback
    }
    if (listingId != null) {
      const v = Number(listingId);
      body.listingId = v;
      body.listing_id = v;           // snake_case fallback
    }

    return axiosInstance.post('/cart-items', body);
  }, 'Failed to add to cart')();

export const updateCartItem = (id, data) =>
  asyncHandler(() => axiosInstance.put(`/cart-items/${id}`, data), 'Failed to update cart item')();
export const deleteCartItem = (id) =>
  asyncHandler(() => axiosInstance.delete(`/cart-items/${id}`), 'Failed to delete cart item')();

export default createCrud;

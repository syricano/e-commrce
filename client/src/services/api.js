// client/services/api.js
import axiosInstance from '@/config/axiosConfig';
import { asyncHandler } from '@/utils';
import { createCrud } from './crudFactory';

/* ===== Auth ===== */
export const register = (payload) =>
  asyncHandler(() => axiosInstance.post('/auth/register', payload), 'Signup failed')();

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
  return b.user || b; // ensure we return the user object
};
export const googleLoginUrl = () =>
  `${import.meta.env.VITE_API_BASE_URL || '/api'}/auth/google`;

/* ===== Public read-only (catalog browse) ===== */
const categories  = createCrud('/categories');
const brands      = createCrud('/brands');
const products    = createCrud('/products');
const collections = createCrud('/collections');

export const getAllCategories = categories.list;
export const getCategoryById  = categories.get;

export const getAllBrands = brands.list;
export const getBrandById = brands.get;

export const getAllProducts = products.list;
export const getProductById = products.get;

export const getAllCollections = collections.list;
export const getCollectionById = collections.get;

/* ===== Profile: self only ===== */
export const getMyProfile = () =>
  asyncHandler(() => axiosInstance.get('/profiles/me'), 'Failed to load profile')();

export const updateMyProfile = (data) =>
  asyncHandler(() => axiosInstance.put('/profiles/me', data), 'Failed to update profile')();

/* ===== Orders: self only ===== */
export const listMyOrders = (params) =>
  asyncHandler(() => axiosInstance.get('/orders/mine', { params }), 'Failed to load orders')();

export const getMyOrder = (id) =>
  asyncHandler(() => axiosInstance.get(`/orders/${id}`), 'Failed to load order')();

/* ===== C2C Listings ===== */
const listings = createCrud('/listings'); // owner can create/update/delete his own

export const searchAll = (params) =>
  asyncHandler(() => axiosInstance.get('/search', { params }), 'Search failed')();

export const getAllListings = listings.list;   // supports query filters
export const getListingById = listings.get;
export const createListing  = listings.create;
export const updateListing  = listings.update;
export const deleteListing  = listings.remove;

export const toggleFavorite = (id) =>
  asyncHandler(() => axiosInstance.post(`/listings/${id}/favorite`), 'Failed to toggle favorite')();

/* ===== Listing Offers ===== */
const listingOffers = createCrud('/listing-offers');
export const createListingOffer = listingOffers.create;           // { listingId, amount, message }
export const updateListingOffer = listingOffers.update;           // e.g. { message } or status changes for buyer
export const deleteListingOffer = listingOffers.remove;
export const getListingOffer    = listingOffers.get;

// seller actions
export const acceptListingOffer = (id, method) =>
  asyncHandler(() => axiosInstance.post(`/listing-offers/${id}/accept`, { method }), 'Failed to accept offer')();

export const declineListingOffer = (id) =>
  asyncHandler(() => axiosInstance.post(`/listing-offers/${id}/decline`), 'Failed to decline offer')();

/* ===== Messaging (threads + messages) ===== */
export const listThreads = (params) =>
  asyncHandler(() => axiosInstance.get('/threads', { params }), 'Failed to fetch threads')();

export const createThread = (data) =>
  asyncHandler(() => axiosInstance.post('/threads', data), 'Failed to create thread')(); // { listingId }

export const sendMessage = (threadId, body) =>
  asyncHandler(() => axiosInstance.post(`/threads/${threadId}/messages`, body), 'Failed to send message')();

/* ===== Reports (abuse) ===== */
export const reportListing = (payload) =>
  asyncHandler(() => axiosInstance.post('/reports', payload), 'Failed to submit report')(); // { listingId, reason, details }

/* ===== Transactions (C2C) ===== */
export const listMyTransactions = (params) =>
  asyncHandler(() => axiosInstance.get('/transactions/mine', { params }), 'Failed to load transactions')();

export const getTransaction = (id) =>
  asyncHandler(() => axiosInstance.get(`/transactions/${id}`), 'Failed to load transaction')();

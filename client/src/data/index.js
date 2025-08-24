import { createCrud } from './crudFactory';
import axiosInstance from '@/config/axiosConfig';
import { asyncHandler } from '@/utils';

/* ===== Auth (non-CRUD) ===== */
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
  return b.user || b; // normalize to user object
};

export const googleLoginUrl = () =>
  `${import.meta.env.VITE_API_BASE_URL || '/api'}/auth/google`;

/* ===== CRUD maps ===== */
const users                  = createCrud('/users');
const addresses              = createCrud('/addresses');
const stores                 = createCrud('/stores');
const storeUsers             = createCrud('/store-users');
const categories             = createCrud('/categories');
const categoryTranslations   = createCrud('/category-translations');
const brands                 = createCrud('/brands');
const brandTranslations      = createCrud('/brand-translations');
const products               = createCrud('/products');
const productTranslations    = createCrud('/product-translations');
const productVariants        = createCrud('/product-variants');
const media                  = createCrud('/media');
const offers                 = createCrud('/offers');
const inventory              = createCrud('/inventory');
const carts                  = createCrud('/carts');
const cartItems              = createCrud('/cart-items');
const orders                 = createCrud('/orders');
const orderItems             = createCrud('/order-items');
const shipments              = createCrud('/shipments');
const payments               = createCrud('/payments');
const refunds                = createCrud('/refunds');
const returnRequests         = createCrud('/return-requests');
const reviews                = createCrud('/reviews');
const reviewVotes            = createCrud('/review-votes');
const commissionSchemes      = createCrud('/commission-schemes');
const payouts                = createCrud('/payouts');
const collections            = createCrud('/collections');
const collectionTranslations = createCrud('/collection-translations');
const collectionRules        = createCrud('/collection-rules');
const placements             = createCrud('/placements');
const auditLogs              = createCrud('/audit-logs');
const profiles               = createCrud('/profiles'); // <-- needed by Profile.jsx

/* ===== Users ===== */
export const getAllUsers  = users.list;
export const getUserById  = users.get;
export const createUser   = users.create;
export const updateUser   = users.update;
export const deleteUser   = users.remove;

/* ===== Addresses ===== */
export const getAllAddresses = addresses.list;
export const getAddressById  = addresses.get;
export const createAddress   = addresses.create;
export const updateAddress   = addresses.update;
export const deleteAddress   = addresses.remove;

/* ===== Stores ===== */
export const getAllStores = stores.list;
export const getStoreById = stores.get;
export const createStore  = stores.create;
export const updateStore  = stores.update;
export const deleteStore  = stores.remove;

/* ===== Store Users ===== */
export const getAllStoreUsers = storeUsers.list;
export const getStoreUserById = storeUsers.get;
export const createStoreUser  = storeUsers.create;
export const updateStoreUser  = storeUsers.update;
export const deleteStoreUser  = storeUsers.remove;

/* ===== Categories ===== */
export const getAllCategories = categories.list;
export const getCategoryById  = categories.get;
export const createCategory   = categories.create;
export const updateCategory   = categories.update;
export const deleteCategory   = categories.remove;

/* ===== Category Translations ===== */
export const getAllCategoryTranslations = categoryTranslations.list;
export const getCategoryTranslationById = categoryTranslations.get;
export const createCategoryTranslation  = categoryTranslations.create;
export const updateCategoryTranslation  = categoryTranslations.update;
export const deleteCategoryTranslation  = categoryTranslations.remove;

/* ===== Brands ===== */
export const getAllBrands = brands.list;
export const getBrandById = brands.get;
export const createBrand  = brands.create;
export const updateBrand  = brands.update;
export const deleteBrand  = brands.remove;

/* ===== Brand Translations ===== */
export const getAllBrandTranslations = brandTranslations.list;
export const getBrandTranslationById = brandTranslations.get;
export const createBrandTranslation  = brandTranslations.create;
export const updateBrandTranslation  = brandTranslations.update;
export const deleteBrandTranslation  = brandTranslations.remove;

/* ===== Products ===== */
export const getAllProducts = products.list;
export const getProductById = products.get;
export const createProduct  = products.create;
export const updateProduct  = products.update;
export const deleteProduct  = products.remove;

/* ===== Product Translations ===== */
export const getAllProductTranslations = productTranslations.list;
export const getProductTranslationById = productTranslations.get;
export const createProductTranslation  = productTranslations.create;
export const updateProductTranslation  = productTranslations.update;
export const deleteProductTranslation  = productTranslations.remove;

/* ===== Product Variants ===== */
export const getAllProductVariants = productVariants.list;
export const getProductVariantById  = productVariants.get;
export const createProductVariant   = productVariants.create;
export const updateProductVariant   = productVariants.update;
export const deleteProductVariant   = productVariants.remove;

/* ===== Media ===== */
export const getAllMedia = media.list;
export const getMediaById = media.get;
export const createMedia  = media.create;
export const updateMedia  = media.update;
export const deleteMedia  = media.remove;

/* ===== Offers ===== */
export const getAllOffers = offers.list;
export const getOfferById = offers.get;
export const createOffer  = offers.create;
export const updateOffer  = offers.update;
export const deleteOffer  = offers.remove;

/* ===== Inventory ===== */
export const getAllInventory = inventory.list;
export const getInventoryById = inventory.get;
export const createInventory  = inventory.create;
export const updateInventory  = inventory.update;
export const deleteInventory  = inventory.remove;

/* ===== Carts ===== */
export const getAllCarts = carts.list;
export const getCartById = carts.get;
export const createCart  = carts.create;
export const updateCart  = carts.update;
export const deleteCart  = carts.remove;

/* ===== Cart Items ===== */
export const getAllCartItems = cartItems.list;
export const getCartItemById = cartItems.get;
export const createCartItem  = cartItems.create;
export const updateCartItem  = cartItems.update;
export const deleteCartItem  = cartItems.remove;

/* ===== Orders ===== */
export const getAllOrders = orders.list;
export const getOrderById = orders.get;
export const createOrder  = orders.create;
export const updateOrder  = orders.update;
export const deleteOrder  = orders.remove;

/* ===== Order Items ===== */
export const getAllOrderItems = orderItems.list;
export const getOrderItemById = orderItems.get;
export const createOrderItem  = orderItems.create;
export const updateOrderItem  = orderItems.update;
export const deleteOrderItem  = orderItems.remove;

/* ===== Shipments ===== */
export const getAllShipments = shipments.list;
export const getShipmentById = shipments.get;
export const createShipment  = shipments.create;
export const updateShipment  = shipments.update;
export const deleteShipment  = shipments.remove;

/* ===== Payments ===== */
export const getAllPayments = payments.list;
export const getPaymentById = payments.get;
export const createPayment  = payments.create;
export const updatePayment  = payments.update;
export const deletePayment  = payments.remove;

/* ===== Refunds ===== */
export const getAllRefunds = refunds.list;
export const getRefundById = refunds.get;
export const createRefund  = refunds.create;
export const updateRefund  = refunds.update;
export const deleteRefund  = refunds.remove;

/* ===== Return Requests ===== */
export const getAllReturnRequests = returnRequests.list;
export const getReturnRequestById = returnRequests.get;
export const createReturnRequest  = returnRequests.create;
export const updateReturnRequest  = returnRequests.update;
export const deleteReturnRequest  = returnRequests.remove;

/* ===== Reviews ===== */
export const getAllReviews = reviews.list;
export const getReviewById = reviews.get;
export const createReview  = reviews.create;
export const updateReview  = reviews.update;
export const deleteReview  = reviews.remove;

/* ===== Review Votes ===== */
export const getAllReviewVotes = reviewVotes.list;
export const getReviewVoteById = reviewVotes.get;
export const createReviewVote  = reviewVotes.create;
export const updateReviewVote  = reviewVotes.update;
export const deleteReviewVote  = reviewVotes.remove;

/* ===== Commission Schemes ===== */
export const getAllCommissionSchemes = commissionSchemes.list;
export const getCommissionSchemeById = commissionSchemes.get;
export const createCommissionScheme  = commissionSchemes.create;
export const updateCommissionScheme  = commissionSchemes.update;
export const deleteCommissionScheme  = commissionSchemes.remove;

/* ===== Payouts ===== */
export const getAllPayouts = payouts.list;
export const getPayoutById = payouts.get;
export const createPayout  = payouts.create;
export const updatePayout  = payouts.update;
export const deletePayout  = payouts.remove;

/* ===== Collections ===== */
export const getAllCollections = collections.list;
export const getCollectionById = collections.get;
export const createCollection  = collections.create;
export const updateCollection  = collections.update;
export const deleteCollection  = collections.remove;

/* ===== Collection Translations ===== */
export const getAllCollectionTranslations = collectionTranslations.list;
export const getCollectionTranslationById = collectionTranslations.get;
export const createCollectionTranslation  = collectionTranslations.create;
export const updateCollectionTranslation  = collectionTranslations.update;
export const deleteCollectionTranslation  = collectionTranslations.remove;

/* ===== Collection Rules ===== */
export const getAllCollectionRules = collectionRules.list;
export const getCollectionRuleById = collectionRules.get;
export const createCollectionRule  = collectionRules.create;
export const updateCollectionRule  = collectionRules.update;
export const deleteCollectionRule  = collectionRules.remove;

/* ===== Placements ===== */
export const getAllPlacements = placements.list;
export const getPlacementById = placements.get;
export const createPlacement  = placements.create;
export const updatePlacement  = placements.update;
export const deletePlacement  = placements.remove;

/* ===== Audit Logs ===== */
export const getAllAuditLogs = auditLogs.list;
export const getAuditLogById = auditLogs.get;
export const createAuditLog  = auditLogs.create;
export const updateAuditLog  = auditLogs.update;
export const deleteAuditLog  = auditLogs.remove;

/* ===== Profiles (needed by Profile.jsx) ===== */
export const getAllProfiles = profiles.list;
export const getProfileById = profiles.get;
export const createProfile  = profiles.create;
export const updateProfile  = profiles.update;
export const deleteProfile  = profiles.remove;

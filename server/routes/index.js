import express from 'express';
import authRouter from './authRouter.js';
import categoryPublicRouter from './categoryPublicRouter.js';
import userRouter from './userRouter.js';
import profileRouter from './profileRouter.js';
import addressRouter from './addressRouter.js';
import storeRouter from './storeRouter.js';
import storeUserRouter from './storeUserRouter.js';
import categoryRouter from './categoryRouter.js';
import categoryTranslationRouter from './categoryTranslationRouter.js';
import brandRouter from './brandRouter.js';
import brandTranslationRouter from './brandTranslationRouter.js';
import productRouter from './productRouter.js';
import productTranslationRouter from './productTranslationRouter.js';
import productVariantRouter from './productVariantRouter.js';
import mediaRouter from './mediaRouter.js';
import offerRouter from './offerRouter.js';
import inventoryRouter from './inventoryRouter.js';
import cartRouter from './cartRouter.js';
import cartItemRouter from './cartItemRouter.js';
import orderRouter from './orderRouter.js';
import orderItemRouter from './orderItemRouter.js';
import shipmentRouter from './shipmentRouter.js';
import paymentRouter from './paymentRouter.js';
import refundRouter from './refundRouter.js';
import returnRequestRouter from './returnRequestRouter.js';
import reviewRouter from './reviewRouter.js';
import reviewVoteRouter from './reviewVoteRouter.js';
import commissionSchemeRouter from './commissionSchemeRouter.js';
import payoutRouter from './payoutRouter.js';
import collectionRouter from './collectionRouter.js';
import collectionTranslationRouter from './collectionTranslationRouter.js';
import collectionRuleRouter from './collectionRuleRouter.js';
import placementRouter from './placementRouter.js';
import auditLogRouter from './auditLogRouter.js';
import passwordResetRouter from './passwordResetRouter.js';

import listingRouter from './listingRouter.js';
import threadRouter from './threadRouter.js';
import listingOfferRouter from './listingOfferRouter.js';
import reportRouter from './reportRouter.js';
import searchRouter from './searchRouter.js';

import transactionRouter from './transactionRouter.js';
import ratingRouter from './ratingRouter.js';
import promotionRouter from './promotionRouter.js';
import savedSearchRouter from './savedSearchRouter.js';
import notificationRouter from './notificationRouter.js';
import blockRouter from './blockRouter.js';
import geoSearchRouter from './geoSearchRouter.js';

import adminRouter from './adminRouter.js';
import partnerRouter from './partnerRouter.js';
import storeCategoryRouter from './storeCategoryRouter.js';
import storeProductRouter from './storeProductRouter.js';
import uploadRouter from './uploadRouter.js';
import storeMerchantRouter from './storeMerchantRouter.js';
import supportRouter from './supportRouter.js';
import storeOfferRouter from './storeOfferRouter.js';

// Public items resolver for collections
import collectionPublicRouter from './collectionPublicRouter.js';
// Admin CRUD for manual picks
import collectionItemRouter from './collectionItemRouter.js';

export const routeMap = [
  { path: '/api/auth', handler: authRouter },
  { path: '/api/admin', handler: adminRouter },
  { path: '/api/users', handler: userRouter },
  { path: '/api/profiles', handler: profileRouter },
  { path: '/api/category-public', handler: categoryPublicRouter },
  { path: '/api/addresses', handler: addressRouter },
  { path: '/api/stores', handler: storeRouter },
  { path: '/api/store-users', handler: storeUserRouter },
  { path: '/api/categories', handler: categoryRouter },
  { path: '/api/category-translations', handler: categoryTranslationRouter },
  { path: '/api/brands', handler: brandRouter },
  { path: '/api/brand-translations', handler: brandTranslationRouter },
  { path: '/api/products', handler: productRouter },
  { path: '/api/product-translations', handler: productTranslationRouter },
  { path: '/api/product-variants', handler: productVariantRouter },
  { path: '/api/media', handler: mediaRouter },
  { path: '/api/offers', handler: offerRouter },
  { path: '/api/inventory', handler: inventoryRouter },
  { path: '/api/carts', handler: cartRouter },
  { path: '/api/cart-items', handler: cartItemRouter },
  { path: '/api/orders', handler: orderRouter },
  { path: '/api/order-items', handler: orderItemRouter },
  { path: '/api/shipments', handler: shipmentRouter },
  { path: '/api/payments', handler: paymentRouter },
  { path: '/api/refunds', handler: refundRouter },
  { path: '/api/return-requests', handler: returnRequestRouter },
  { path: '/api/reviews', handler: reviewRouter },
  { path: '/api/review-votes', handler: reviewVoteRouter },
  { path: '/api/commission-schemes', handler: commissionSchemeRouter },
  { path: '/api/payouts', handler: payoutRouter },

  // Public collection items endpoint
  { path: '/api/collections', handler: collectionPublicRouter },

  { path: '/api/collections', handler: collectionRouter },
  { path: '/api/collection-translations', handler: collectionTranslationRouter },
  { path: '/api/collection-rules', handler: collectionRuleRouter },
  { path: '/api/collection-items', handler: collectionItemRouter },
  { path: '/api/placements', handler: placementRouter },
  { path: '/api/audit-logs', handler: auditLogRouter },
  { path: '/api/password-resets', handler: passwordResetRouter },

  { path: '/api/listings', handler: listingRouter },
  { path: '/api/threads', handler: threadRouter },
  { path: '/api/listing-offers', handler: listingOfferRouter },
  { path: '/api/reports', handler: reportRouter },
  { path: '/api/search', handler: searchRouter },

  { path: '/api/transactions', handler: transactionRouter },
  { path: '/api/ratings', handler: ratingRouter },
  { path: '/api/promotions', handler: promotionRouter },
  { path: '/api/saved-searches', handler: savedSearchRouter },
  { path: '/api/notifications', handler: notificationRouter },
  { path: '/api/blocks', handler: blockRouter },
  { path: '/api/geo', handler: geoSearchRouter },
  { path: '/api/partners', handler: partnerRouter },
  { path: '/api/store-categories', handler: storeCategoryRouter },
  { path: '/api/store-products', handler: storeProductRouter },
  { path: '/api/store-offers', handler: storeOfferRouter },
  { path: '/api/merchant/upload', handler: uploadRouter },
  { path: '/api/merchant/stores', handler: storeMerchantRouter },
  { path: '/api/support', handler: supportRouter },
];

export default function mountAll(app) {
  const router = express.Router();
  for (const { path, handler } of routeMap) router.use(path, handler);
  app.use(router);
}

import userRouter from './userRouter.js';
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
import commissionSchemeRouter from './commissionSchemeRouter.js';
import payoutRouter from './payoutRouter.js';
import collectionRouter from './collectionRouter.js';
import collectionTranslationRouter from './collectionTranslationRouter.js';
import collectionRuleRouter from './collectionRuleRouter.js';
import placementRouter from './placementRouter.js';
import reviewVoteRouter from './reviewVoteRouter.js';
import auditLogRouter from './auditLogRouter.js';
import authRouter from './authRouter.js';


export const routeMap = [
  { path: '/api/auth', handler: authRouter },
  { path: '/api/users', handler: userRouter },
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
  { path: '/api/commission-schemes', handler: commissionSchemeRouter },
  { path: '/api/payouts', handler: payoutRouter },
  { path: '/api/collections', handler: collectionRouter },
  { path: '/api/collection-translations', handler: collectionTranslationRouter },
  { path: '/api/collection-rules', handler: collectionRuleRouter },
  { path: '/api/placements', handler: placementRouter },
  { path: '/api/review-votes', handler: reviewVoteRouter },
  { path: '/api/audit-logs', handler: auditLogRouter }
];

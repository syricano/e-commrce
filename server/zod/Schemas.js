// server/zod/Schemas.js
import { z } from 'zod';

// ===== Primitives / helpers =====
export const id = z.number().int().positive();
export const bigId = id;
export const locale = z.enum(['ar','en','de']);
export const currency = z.enum(['EUR', 'USD', 'SAR', 'AED', 'GBP']);

const stringOpt = (max = 255) => z.string().min(1).max(max);
const stringNullable = (max = 255) => z.string().max(max).nullable().optional();
const jsonb = z.record(z.any()).optional();
const bool = z.boolean();
const int = z.number().int();
const intPos = int.nonnegative();
const dateIso = z.coerce.date().optional();

// ===== User =====
export const userRole = z.enum(['customer','seller','staff','admin']);
export const userStatus = z.enum(['active','suspended','pending']);

export const userSchema = z.object({
  email: z.string().email().max(320),
  phone: z.string().max(32).optional(),
  firstName: z.string().max(120).optional(),
  lastName: z.string().max(120).optional(),
  password: z.string().min(6).max(255).optional(),
  oauthProvider: z.string().max(32).optional(),
  oauthSubject: z.string().max(191).optional(),
  role: userRole.default('customer'),
  status: userStatus.default('active'),
  metadata: jsonb
});

// ===== Address =====
export const addressSchema = z.object({
  userId: bigId,
  fullName: stringOpt(160),
  phone: stringOpt(32),
  country: z.string().length(2),
  city: stringOpt(120),
  street: stringOpt(255),
  postalCode: z.string().max(16).optional(),
  isDefault: bool.optional(),
  metadata: jsonb
});

// ===== Store / StoreUser =====
export const storeStatus = z.enum(['pending','active','suspended']);
export const storeSchema = z.object({
  ownerUserId: bigId,
  name: stringOpt(200),
  slug: stringOpt(255),
  logoUrl: z.string().url().max(1024).optional(),
  coverUrl: z.string().url().max(1024).optional(),
  status: storeStatus.default('pending'),
  commissionSchemeId: bigId.optional(),
  kycData: jsonb,
  metadata: jsonb
});

export const storeUserRole = z.enum(['owner','manager','staff']);
export const storeUserStatus = z.enum(['active','revoked']);

export const storeUserSchema = z.object({
  storeId: bigId,
  userId: bigId,
  role: storeUserRole.default('staff'),
  status: storeUserStatus.default('active')
});

// ===== Category + Translation =====
export const categorySchema = z.object({
  parentId: bigId.optional(),
  position: int.default(0),
  isActive: bool.default(true),
  metadata: jsonb
});

export const categoryTranslationSchema = z.object({
  categoryId: bigId,
  locale,
  name: stringOpt(200),
  slug: stringOpt(255).optional(),
  metaTitle: stringNullable(255),
  metaDescription: stringNullable(500)
});

// ===== Brand + Translation =====
export const brandSchema = z.object({
  isActive: bool.default(true),
  metadata: jsonb
});

export const brandTranslationSchema = z.object({
  brandId: bigId,
  locale,
  name: stringOpt(200),
  slug: stringOpt(255)
});

// ===== Product + Translation + Variant =====
export const moderationStatus = z.enum(['draft','pending','approved','rejected']);

export const productSchema = z.object({
  canonicalSku: z.string().max(64).optional(),
  brandId: bigId.optional(),
  defaultCategoryId: bigId.optional(),
  gtin: z.string().max(32).optional(),
  taxClass: z.string().max(32).optional(),
  attributes: jsonb,
  isActive: bool.default(false),
  moderationStatus: moderationStatus.default('draft'),
  publishedAt: dateIso
});

export const productTranslationSchema = z.object({
  productId: bigId,
  locale,
  name: stringOpt(255),
  slug: stringOpt(255),
  shortDescription: z.string().max(500).optional(),
  longDescription: z.string().optional(),
  metaTitle: stringNullable(255),
  metaDescription: stringNullable(500)
});

export const productVariantSchema = z.object({
  productId: bigId,
  variantSku: stringOpt(64),
  barcode: z.string().max(64).optional(),
  options: jsonb,
  weightGrams: intPos.optional(),
  lengthMm: intPos.optional(),
  widthMm: intPos.optional(),
  heightMm: intPos.optional(),
  isActive: bool.default(true)
});

// ===== Media =====
export const mediaType = z.enum(['image','video']);
export const mediaSchema = z.object({
  productId: bigId.optional(),
  variantId: bigId.optional(),
  url: z.string().url().max(1024),
  type: mediaType.default('image'),
  position: intPos.default(0),
  altText: z.record(z.string()).optional(),
  metadata: jsonb
}).refine(d => d.productId || d.variantId, { message: 'productId or variantId required' });

// ===== Offer + Inventory =====
export const conditionEnum = z.enum(['new','used','refurbished']);
export const minorAmount = int.nonnegative();

export const offerSchema = z.object({
  storeId: bigId,
  variantId: bigId,
  condition: conditionEnum.default('new'),
  priceAmount: minorAmount,
  compareAtAmount: minorAmount.optional(),
  currency: currency.default('EUR'),
  minQty: intPos.default(1),
  maxQty: intPos.optional(),
  leadTimeDays: intPos.optional(),
  isActive: bool.default(true)
});

export const inventorySchema = z.object({
  offerId: bigId,
  stockOnHand: intPos.default(0),
  stockReserved: intPos.default(0),
  reorderPoint: intPos.default(0),
  backorderPolicy: z.enum(['deny','allow']).default('deny')
});

// ===== Cart + CartItem =====
export const cartSchema = z.object({
  userId: bigId.optional(),
  guestToken: z.string().max(64).optional(),
  currency: currency.default('EUR'),
  itemsSubtotalAmount: minorAmount.default(0),
  shippingAmount: minorAmount.default(0),
  taxAmount: minorAmount.default(0),
  discountAmount: minorAmount.default(0),
  grandTotalAmount: minorAmount.default(0),
  expiresAt: dateIso
});

export const cartItemSchema = z.object({
  cartId: bigId,
  offerId: bigId,
  quantity: intPos.min(1),
  unitPriceAmount: minorAmount
});

// ===== Order + OrderItem =====
export const paymentStatusEnum = z.enum(['unpaid','paid','refunded','partial_refund']);
export const fulfillmentStatusEnum = z.enum(['unfulfilled','partial','fulfilled','cancelled']);

export const orderSchema = z.object({
  userId: bigId.optional(),
  number: stringOpt(24),
  currency: currency.default('EUR'),
  itemsSubtotalAmount: minorAmount,
  shippingAmount: minorAmount,
  taxAmount: minorAmount,
  discountAmount: minorAmount.default(0),
  grandTotalAmount: minorAmount,
  paymentStatus: paymentStatusEnum.default('unpaid'),
  fulfillmentStatus: fulfillmentStatusEnum.default('unfulfilled'),
  placedAt: z.coerce.date()
});

export const orderItemSchema = z.object({
  orderId: bigId,
  offerId: bigId,
  storeId: bigId,
  productSnapshotName: stringOpt(255),
  snapshotLocale: locale.default('ar'),
  unitPriceAmount: minorAmount,
  quantity: intPos.min(1),
  taxRatePct: z.number().min(0).max(100).default(0)
});

// ===== Shipment =====
export const shipmentStatus = z.enum(['pending','shipped','delivered','lost','returned']);
export const shipmentSchema = z.object({
  orderId: bigId,
  storeId: bigId,
  carrier: z.string().max(80).optional(),
  trackingNumber: z.string().max(120).optional(),
  status: shipmentStatus.default('pending'),
  shippedAt: dateIso,
  deliveredAt: dateIso
});

// ===== Payment / Refund / ReturnRequest =====
export const gatewayStatus = z.enum(['authorized','captured','voided','refunded','failed']);
export const paymentSchema = z.object({
  orderId: bigId,
  provider: stringOpt(50),
  transactionId: stringOpt(128),
  status: gatewayStatus.default('authorized'),
  amount: minorAmount,
  currency: currency.default('EUR'),
  capturedAt: dateIso,
  rawResponse: jsonb
});

export const refundStatus = z.enum(['pending','approved','rejected','processed']);
export const refundSchema = z.object({
  orderId: bigId,
  paymentId: bigId.optional(),
  amount: minorAmount,
  currency: currency.default('EUR'),
  reason: z.string().max(255).optional(),
  status: refundStatus.default('pending')
});

export const returnStatus = z.enum(['requested','approved','rejected','received','refunded']);
export const returnRequestSchema = z.object({
  orderId: bigId,
  orderItemId: bigId,
  reason: z.string().max(255).optional(),
  status: returnStatus.default('requested'),
  notes: z.string().optional()
});

// ===== Review / ReviewVote =====
export const reviewStatus = z.enum(['pending','approved','rejected']);
export const reviewSchema = z.object({
  userId: bigId,
  productId: bigId,
  storeId: bigId.optional(),
  rating: int.min(1).max(5),
  title: z.string().max(200).optional(),
  body: z.string().optional(),
  status: reviewStatus.default('pending')
});

export const reviewVoteSchema = z.object({
  reviewId: bigId,
  userId: bigId,
  value: z.enum(['up','down']).default('up')
});

// ===== CommissionScheme / Payout =====
export const commissionType = z.enum(['percent','flat','tiered']);
export const commissionSchemeSchema = z.object({
  name: stringOpt(120),
  type: commissionType.default('percent'),
  value: z.number().nonnegative().default(0.1),
  overrides: jsonb,
  effectiveFrom: dateIso,
  effectiveTo: dateIso
});

export const payoutStatus = z.enum(['pending','in_transit','paid','failed']);
export const payoutSchema = z.object({
  storeId: bigId,
  amount: minorAmount,
  currency: currency.default('EUR'),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  status: payoutStatus.default('pending'),
  externalRef: z.string().max(128).optional(),
  fees: jsonb,
  metadata: jsonb
});

// ===== Collection + Translation + Rule + Placement =====
export const collectionType = z.enum(['manual','rule']);
export const collectionSchema = z.object({
  key: stringOpt(120),
  type: collectionType.default('manual'),
  isActive: bool.default(true),
  metadata: jsonb
});

export const collectionTranslationSchema = z.object({
  collectionId: bigId,
  locale,
  title: stringOpt(200),
  slug: stringOpt(255),
  subtitle: z.string().max(255).optional()
});

export const collectionRuleSchema = z.object({
  collectionId: bigId,
  query: z.record(z.any())
});

export const placementSchema = z.object({
  slot: stringOpt(120),
  collectionId: bigId,
  position: intPos.default(0),
  localeVisibility: z.array(locale).optional()
});

// ===== AuditLog =====
export const auditLogSchema = z.object({
  actorUserId: bigId.optional(),
  entity: stringOpt(80),
  entityId: bigId,
  action: stringOpt(80),
  before: jsonb,
  after: jsonb
});

// ========= C2C ADDITIONS =========

// Listings
export const listingCreateSchema = z.object({
  categoryId: bigId.optional(),
  priceAmount: int.nonnegative(),
  currency: currency.default('EUR'),
  negotiable: bool.default(false),
  allowCheckout: bool.default(false).optional(),
  condition: z.enum(['new','used','refurbished']).default('used'),
  locationCity: z.string().max(120).optional(),
  locationLat: z.number().min(-90).max(90).optional().nullable(),
  locationLng: z.number().min(-180).max(180).optional().nullable(),
  status: z.enum(['draft','active','reserved','sold','expired']).optional(),
  metadata: z.record(z.any()).optional(),
  translations: z
    .array(
      z.object({
        locale,
        title: stringOpt(255),
        slug: stringOpt(255).optional(),
        description: z.string().optional(),
      })
    )
    .min(1),
});

export const listingUpdateSchema = listingCreateSchema.partial();

export const listingSearchSchema = z.object({
  q: z.string().optional(),
  status: z.enum(['draft','active','reserved','sold','expired']).optional(),
  mine: z.union([z.boolean(), z.string()]).optional(),
  type: z.enum(['private','store']).optional(),
  categoryId: z.coerce.number().int().optional(),
  minPrice: z.coerce.number().int().optional(),
  maxPrice: z.coerce.number().int().optional(),
  condition: z.enum(['new','used','refurbished']).optional(),
  city: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['new','price_asc','price_desc','popular']).optional(),
  // Optional JSON string to filter by metadata (category-specific attributes)
  attrs: z.string().optional(),
});

// Threads
export const threadCreateSchema = z.object({
  listingId: bigId,
  buyerUserId: bigId.optional(), // server will override from auth
  message: z.string().min(1).max(5000).optional()
});

export const messageCreateSchema = z.object({
  body: z.string().min(1).max(5000),
  attachments: z.any().optional()
});

// Listing offers
export const listingOfferCreateSchema = z.object({
  listingId: bigId,
  amount: int.nonnegative(),
  message: z.string().max(2000).optional()
});

export const listingOfferPatchSchema = z.object({
  action: z.enum(['accept','decline','withdraw'])
});

// Listing status patch
export const listingStatusEnum = z.enum(['draft','active','reserved','sold','expired']);
export const listingStatusPatchSchema = z.object({
  status: listingStatusEnum
});

// ===== Admin payloads =====
export const adminUserRoleStatusSchema = z.object({
  role: userRole.optional(),
  status: userStatus.optional(),
});

export const adminUserUpdateSchema = z.object({
  email: z.string().email().max(320).optional(),
  firstName: z.string().max(120).optional(),
  lastName: z.string().max(120).optional(),
  phone: z.string().max(32).optional(),
  role: userRole.optional(),
  status: userStatus.optional(),
  metadata: z.record(z.any()).optional(),
});

export const adminModerateProductSchema = z.object({
  moderationStatus: moderationStatus.optional(),
  isActive: z.boolean().optional(),
});

export const adminModerateListingSchema = z.object({
  status: listingStatusEnum,
});

export const adminReviewReportSchema = z.object({
  status: z.enum(['open','reviewed','actioned']),
  note: z.string().max(1000).optional(),
});

export const adminAssignCommissionSchema = z.object({
  commissionSchemeId: bigId.nullable().optional(),
});

export const adminUpdatePayoutStatusSchema = z.object({
  status: payoutStatus,
  externalRef: z.string().max(128).optional(),
});

export const adminImpersonateSchema = z.object({
  userId: bigId,
});

// Reports
export const reportCreateSchema = z.object({
  listingId: bigId,
  reason: z.enum(['spam','prohibited','fraud','other']),
  details: z.string().max(2000).optional()
});

// Unified search
export const unifiedSearchSchema = z.object({
  q: z.string().optional(),
  categoryId: z.string().optional(),
  type: z.enum(['all','listing','product']).optional().default('all'),
  page: z.string().optional(),
  limit: z.string().optional()
});

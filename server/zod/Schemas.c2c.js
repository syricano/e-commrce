import { z } from 'zod';
export const methodEnum = z.enum(['online','cash','third_party']);
export const txStatusEnum = z.enum(['initiated','awaiting_payment','paid','cancelled','completed','disputed']);
export const ratingRole = z.enum(['buyer','seller']);
export const promoType = z.enum(['bump','spotlight']);
export const promoStatus = z.enum(['pending','active','expired','cancelled']);

export const c2cTransactionSchema = z.object({
  listingId: z.number().int().positive(),
  buyerUserId: z.number().int().positive(),
  sellerUserId: z.number().int().positive(),
  amount: z.number().int().nonnegative(),
  currency: z.string().length(3).default('EUR'),
  method: methodEnum,
  status: txStatusEnum.default('initiated'),
  externalRef: z.string().max(128).optional(),
  metadata: z.record(z.any()).optional()
});

export const userRatingSchema = z.object({
  transactionId: z.number().int().positive(),
  rateeUserId: z.number().int().positive(),
  role: ratingRole,
  stars: z.number().int().min(1).max(5),
  comment: z.string().optional()
});

export const listingPromotionSchema = z.object({
  listingId: z.number().int().positive(),
  type: promoType.default('bump'),
  status: promoStatus.default('active'),
  startAt: z.coerce.date().optional(),
  endAt: z.coerce.date().optional(),
  chargeId: z.string().max(128).optional(),
  metadata: z.record(z.any()).optional()
});

export const savedSearchSchema = z.object({
  title: z.string().max(200).optional(),
  query: z.record(z.any()),
  lat: z.number().optional(),
  lng: z.number().optional(),
  radiusKm: z.number().int().positive().optional(),
  isActive: z.boolean().default(true)
});

export const notificationSchema = z.object({
  type: z.string().max(64),
  data: z.record(z.any()).optional()
});

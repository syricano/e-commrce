// server/controllers/adminController.js
import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';

import asyncHandler from '../utils/asyncHandler.js';

import User from '../models/User.js';
import Store from '../models/Store.js';
import Product from '../models/Product.js';
import Listing from '../models/Listing.js';
import Report from '../models/Report.js';
import Payout from '../models/Payout.js';
import CommissionScheme from '../models/CommissionScheme.js';
import AuditLog from '../models/AuditLog.js';

/* helpers */
const audit = (req, { entity, entityId, action, before = null, after = null }) =>
  AuditLog.create({
    actorUserId: req.user.id,
    entity, entityId, action, before, after
  });

/* ===== Dashboard ===== */
export const getDashboardStats = asyncHandler(async (_req, res) => {
  const [users, stores, products, listings, reportsOpen, payoutsPending] = await Promise.all([
    User.count(),
    Store.count(),
    Product.count(),
    Listing.count(),
    Report.count({ where: { status: 'open' } }),
    Payout.count({ where: { status: 'pending' } }),
  ]);
  res.json({
    users, stores, products, listings,
    reportsOpen, payoutsPending,
  });
});

/* ===== Users (admin) ===== */
export const searchUsers = asyncHandler(async (req, res) => {
  const { q = '', role, status, page = '1', limit = '50' } = req.query;
  const where = {};
  if (q) {
    const like = `%${q}%`;
    where[Op.or] = [
      { email: { [Op.iLike]: like } },
      { phone: { [Op.iLike]: like } },
      { firstName: { [Op.iLike]: like } },
      { lastName: { [Op.iLike]: like } },
    ];
  }
  if (role) where.role = role;
  if (status) where.status = status;

  const rows = await User.findAndCountAll({
    where,
    order: [['id', 'DESC']],
    limit: +limit,
    offset: (+page - 1) * (+limit),
  });
  res.json({ total: rows.count, items: rows.rows });
});

export const updateUserRoleStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role, status } = req.body; // validate with Zod on route if you like
  const row = await User.findByPk(id);
  if (!row) return res.status(404).json({ error: 'User not found' });

  const before = row.toJSON();
  await row.update({ role: role ?? row.role, status: status ?? row.status });
  await audit(req, { entity: 'User', entityId: row.id, action: 'updateRoleStatus', before, after: row.toJSON() });
  res.json(row);
});

export const suspendUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const row = await User.findByPk(id);
  if (!row) return res.status(404).json({ error: 'User not found' });

  const before = row.toJSON();
  await row.update({ status: 'suspended' });
  await audit(req, { entity: 'User', entityId: row.id, action: 'suspend', before, after: row.toJSON() });
  res.json(row);
});

/* ===== Products moderation ===== */
export const moderateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { moderationStatus, isActive } = req.body; // 'draft'|'pending'|'approved'|'rejected'
  const row = await Product.findByPk(id);
  if (!row) return res.status(404).json({ error: 'Product not found' });

  const before = row.toJSON();
  const patch = {};
  if (moderationStatus) patch.moderationStatus = moderationStatus;
  if (typeof isActive === 'boolean') patch.isActive = isActive;
  if (moderationStatus === 'approved' && isActive) patch.publishedAt = new Date();

  await row.update(patch);
  await audit(req, { entity: 'Product', entityId: row.id, action: 'moderate', before, after: row.toJSON() });
  res.json(row);
});

/* ===== Listings moderation (C2C) ===== */
export const moderateListing = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'draft'|'active'|'reserved'|'sold'|'expired'
  const row = await Listing.findByPk(id);
  if (!row) return res.status(404).json({ error: 'Listing not found' });

  const before = row.toJSON();
  await row.update({ status });
  await audit(req, { entity: 'Listing', entityId: row.id, action: 'moderate', before, after: row.toJSON() });
  res.json(row);
});

/* ===== Reports triage ===== */
export const reviewReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body; // 'open'|'reviewed'|'actioned'
  const row = await Report.findByPk(id);
  if (!row) return res.status(404).json({ error: 'Report not found' });

  const before = row.toJSON();
  const patch = { status };
  if (status === 'actioned') patch.resolvedAt = new Date();
  if (note) patch.details = `${row.details || ''}\n[admin] ${note}`.trim();

  await row.update(patch);
  await audit(req, { entity: 'Report', entityId: row.id, action: 'review', before, after: row.toJSON() });
  res.json(row);
});

/* ===== Stores, commissions, payouts ===== */
export const assignCommissionScheme = asyncHandler(async (req, res) => {
  const { id } = req.params; // storeId
  const { commissionSchemeId } = req.body;
  const store = await Store.findByPk(id);
  if (!store) return res.status(404).json({ error: 'Store not found' });

  if (commissionSchemeId) {
    const cs = await CommissionScheme.findByPk(commissionSchemeId);
    if (!cs) return res.status(400).json({ error: 'Invalid commission scheme' });
  }

  const before = store.toJSON();
  await store.update({ commissionSchemeId: commissionSchemeId ?? null });
  await audit(req, { entity: 'Store', entityId: store.id, action: 'assignCommission', before, after: store.toJSON() });
  res.json(store);
});

export const updatePayoutStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, externalRef } = req.body; // 'pending'|'in_transit'|'paid'|'failed'
  const payout = await Payout.findByPk(id);
  if (!payout) return res.status(404).json({ error: 'Payout not found' });

  const before = payout.toJSON();
  await payout.update({ status: status ?? payout.status, externalRef: externalRef ?? payout.externalRef });
  await audit(req, { entity: 'Payout', entityId: payout.id, action: 'updateStatus', before, after: payout.toJSON() });
  res.json(payout);
});

/* ===== Admin impersonation (short-lived token) ===== */
export const impersonate = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const target = await User.findByPk(userId);
  if (!target) return res.status(404).json({ error: 'User not found' });

  const token = jwt.sign({ id: target.id }, process.env.JWT_SECRET, { expiresIn: '30m' });
  // set httpOnly cookie for convenience (and return token too)
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 60 * 1000,
  });
  await audit(req, { entity: 'User', entityId: target.id, action: 'impersonate' });
  res.json({ token, user: { id: target.id, email: target.email, role: target.role } });
});

// === Admin: update/delete user (basic account fields) ===
export const updateUserByAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const row = await User.findByPk(id);
  if (!row) return res.status(404).json({ error: 'User not found' });

  const before = row.toJSON();
  const allowed = ['email','firstName','lastName','phone','role','status','metadata'];
  const patch = {};
  for (const k of allowed) if (Object.prototype.hasOwnProperty.call(req.body, k)) patch[k] = req.body[k];

  await row.update(patch);
  await audit(req, { entity: 'User', entityId: row.id, action: 'adminUpdate', before, after: row.toJSON() });
  res.json(row);
});

export const deleteUserByAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const row = await User.findByPk(id);
  if (!row) return res.status(404).json({ error: 'User not found' });

  const before = row.toJSON();
  await row.destroy(); // respects paranoid soft delete if enabled
  await audit(req, { entity: 'User', entityId: id, action: 'adminDelete', before, after: null });
  res.json({ ok: true });
});

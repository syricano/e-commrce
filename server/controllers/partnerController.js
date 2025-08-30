import asyncHandler from '../utils/asyncHandler.js';
import PartnerInquiry from '../models/PartnerInquiry.js';
import User from '../models/User.js';
import Store from '../models/Store.js';

export const createInquiry = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const row = await PartnerInquiry.create({
    name: body.name,
    email: body.email,
    phone: body.phone,
    businessField: body.businessField,
    country: body.country,
    city: body.city,
    address: body.address,
    shippingOptions: body.shippingOptions || [],
    preferredPayments: body.preferredPayments || [],
    message: body.message,
  });
  res.status(201).json(row);
});

export const listInquiries = asyncHandler(async (req, res) => {
  const { page = '1', limit = '50', status } = req.query;
  const where = {};
  if (status) where.status = status;
  const rows = await PartnerInquiry.findAndCountAll({
    where,
    order: [['id','DESC']],
    limit: +limit,
    offset: (+page - 1) * (+limit),
  });
  res.json({ total: rows.count, items: rows.rows });
});

export const updateInquiry = asyncHandler(async (req, res) => {
  const row = await PartnerInquiry.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  await row.update(req.body);
  res.json(row);
});

export const approveInquiry = asyncHandler(async (req, res) => {
  const row = await PartnerInquiry.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  // Try to find a user either by attached userId or by email
  let user = null;
  if (row.userId) user = await User.findByPk(row.userId);
  if (!user && row.email) user = await User.findOne({ where: { email: row.email } });
  if (user) await user.update({ role: user.role === 'admin' || user.role === 'staff' ? user.role : 'seller' });
  // Create a store from the inquiry details when possible
  let store = null;
  if (user) {
    const name = row.name || `${row.businessField || 'Store'}-${user.id}`;
    const slugify = (s='') => String(s).trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');
    const payload = {
      ownerUserId: user.id,
      name,
      slug: slugify(name),
      email: row.email,
      phone: row.phone,
      country: row.country,
      city: row.city,
      address: row.address,
      status: 'active',
    };
    try { store = await Store.create(payload); }
    catch (e) {
      try { store = await Store.create({ ...payload, slug: `${payload.slug}-${Date.now()}` }); } catch {}
    }
  }
  await row.update({ status: 'approved' });
  res.json({ ok: true, inquiry: row, user: user ? { id: user.id, role: user.role } : null, store });
});

export const declineInquiry = asyncHandler(async (req, res) => {
  const row = await PartnerInquiry.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  await row.update({ status: 'declined' });
  res.json({ ok: true, inquiry: row, message: 'We are sorry, your partner request was declined.' });
});

export default { createInquiry, listInquiries, updateInquiry };

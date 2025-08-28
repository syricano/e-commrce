import asyncHandler from '../utils/asyncHandler.js';
import PartnerInquiry from '../models/PartnerInquiry.js';

export const createInquiry = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const row = await PartnerInquiry.create({
    name: body.name,
    email: body.email,
    phone: body.phone,
    businessField: body.businessField,
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

export default { createInquiry, listInquiries, updateInquiry };


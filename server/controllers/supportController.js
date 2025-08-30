import asyncHandler from '../utils/asyncHandler.js';
import AuditLog from '../models/AuditLog.js';

export const createSupportRequest = asyncHandler(async (req, res) => {
  const { subject, message } = req.body || {};
  await AuditLog.create({
    actorUserId: req.user?.id || null,
    entity: 'Support', entityId: 0, action: 'request',
    before: null,
    after: { subject, message }
  });
  res.status(201).json({ ok: true });
});

export default { createSupportRequest };


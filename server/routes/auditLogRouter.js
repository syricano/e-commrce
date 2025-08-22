import express from 'express';
import { getAllAuditLogs, getAuditLogById, createAuditLog, updateAuditLog, deleteAuditLog } from '../controllers/auditLog.controller.js';
import auth from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = express.Router();
router.get('/', auth, requireAdmin, getAllAuditLogs);
router.get('/:id', auth, requireAdmin, getAuditLogById);
router.post('/', auth, requireAdmin, createAuditLog);
router.put('/:id', auth, requireAdmin, updateAuditLog);
router.delete('/:id', auth, requireAdmin, deleteAuditLog);
export default router;

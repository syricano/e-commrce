import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import { listAuditLogs, getAuditLog, createAuditLog, updateAuditLog, deleteAuditLog } from '../controllers/auditLogController.js';

const auditLogRouter = express.Router();

// Public reads
auditLogRouter.get('/', listAuditLogs);
auditLogRouter.get('/:id', getAuditLog);

// Protected writes
auditLogRouter.post('/', auth, requireAdmin, createAuditLog);
auditLogRouter.put('/:id', auth, requireAdmin, updateAuditLog);
auditLogRouter.delete('/:id', auth, requireAdmin, deleteAuditLog);

export default auditLogRouter;

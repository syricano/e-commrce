import AuditLog from '../models/AuditLog.js';
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';

export const listAuditLogs = list(AuditLog);
export const getAuditLog = getById(AuditLog);
export const createAuditLog = createOne(AuditLog);
export const updateAuditLog = updateById(AuditLog);
export const deleteAuditLog = deleteById(AuditLog);

export default { listAuditLogs, getAuditLog, createAuditLog, updateAuditLog, deleteAuditLog };

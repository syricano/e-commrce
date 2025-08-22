import AuditLog from '../models/AuditLog.js';
import buildCrud from './crudFactory.js';
export const { getAll: getAllAuditLogs, getById: getAuditLogById, createOne: createAuditLog, updateOne: updateAuditLog, deleteOne: deleteAuditLog } =
  buildCrud(AuditLog, { modelName: 'AuditLog', listDefaultOrder: [['id','DESC']] });

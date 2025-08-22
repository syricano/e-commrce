import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  actorUserId: { type: DataTypes.BIGINT },
  entity: { type: DataTypes.STRING(80), allowNull:false },
  entityId: { type: DataTypes.BIGINT, allowNull:false },
  action: { type: DataTypes.STRING(80), allowNull:false },
  before: { type: DataTypes.JSONB },
  after: { type: DataTypes.JSONB }
},{ tableName:'audit_logs', underscored:true });
export default AuditLog;

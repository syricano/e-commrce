import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const ReturnRequest = sequelize.define('ReturnRequest', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  orderId: { type: DataTypes.BIGINT, allowNull:false },
  orderItemId: { type: DataTypes.BIGINT, allowNull:false },
  reason: { type: DataTypes.STRING(255) },
  status: { type: DataTypes.ENUM('requested','approved','rejected','received','refunded'), allowNull:false, defaultValue:'requested' },
  notes: { type: DataTypes.TEXT }
},{ tableName:'return_requests', underscored:true, paranoid:true });
export default ReturnRequest;

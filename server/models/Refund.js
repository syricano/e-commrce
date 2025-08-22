import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const Refund = sequelize.define('Refund', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  orderId: { type: DataTypes.BIGINT, allowNull:false },
  paymentId: { type: DataTypes.BIGINT },
  amount: { type: DataTypes.INTEGER, allowNull:false },
  currency: { type: DataTypes.STRING(3), allowNull:false, defaultValue:'EUR' },
  reason: { type: DataTypes.STRING(255) },
  status: { type: DataTypes.ENUM('pending','approved','rejected','processed'), allowNull:false, defaultValue:'pending' }
},{ tableName:'refunds', underscored:true, paranoid:true });
export default Refund;

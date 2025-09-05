import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const Order = sequelize.define('Order', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.BIGINT },
  number: { type: DataTypes.STRING(24), allowNull:false, unique:true },
  lookupToken: { type: DataTypes.TEXT },
  currency: { type: DataTypes.STRING(3), allowNull:false, defaultValue:'EUR' },
  itemsSubtotalAmount: { type: DataTypes.INTEGER, allowNull:false },
  shippingAmount: { type: DataTypes.INTEGER, allowNull:false },
  taxAmount: { type: DataTypes.INTEGER, allowNull:false },
  discountAmount: { type: DataTypes.INTEGER, allowNull:false, defaultValue:0 },
  grandTotalAmount: { type: DataTypes.INTEGER, allowNull:false },
  paymentStatus: { type: DataTypes.ENUM('unpaid','paid','refunded','partial_refund'), allowNull:false, defaultValue:'unpaid' },
  fulfillmentStatus: { type: DataTypes.ENUM('unfulfilled','partial','fulfilled','cancelled'), allowNull:false, defaultValue:'unfulfilled' },
  placedAt: { type: DataTypes.DATE, allowNull:false },
  // New: capture checkout details
  shippingData: { type: DataTypes.JSONB },
  paymentData: { type: DataTypes.JSONB },
  customerNote: { type: DataTypes.TEXT },
},{ tableName:'orders', underscored:true, paranoid:true });
export default Order;

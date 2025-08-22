import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  orderId: { type: DataTypes.BIGINT, allowNull:false },
  provider: { type: DataTypes.STRING(50), allowNull:false },
  transactionId: { type: DataTypes.STRING(128), allowNull:false },
  status: { type: DataTypes.ENUM('authorized','captured','voided','refunded','failed'), allowNull:false, defaultValue:'authorized' },
  amount: { type: DataTypes.INTEGER, allowNull:false },
  currency: { type: DataTypes.STRING(3), allowNull:false, defaultValue:'EUR' },
  capturedAt: { type: DataTypes.DATE },
  rawResponse: { type: DataTypes.JSONB }
},{ tableName:'payments', underscored:true, paranoid:true });
export default Payment;

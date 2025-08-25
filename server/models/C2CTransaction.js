import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const C2CTransaction = sequelize.define('C2CTransaction', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  listingId: { type: DataTypes.BIGINT, allowNull:false },
  buyerUserId: { type: DataTypes.BIGINT, allowNull:false },
  sellerUserId: { type: DataTypes.BIGINT, allowNull:false },
  amount: { type: DataTypes.INTEGER, allowNull:false },
  currency: { type: DataTypes.STRING(3), allowNull:false, defaultValue:'EUR' },
  method: { type: DataTypes.ENUM('online','cash','third_party'), allowNull:false },
  status: { type: DataTypes.ENUM('initiated','awaiting_payment','paid','cancelled','completed','disputed'), allowNull:false, defaultValue:'initiated' },
  externalRef: { type: DataTypes.STRING(128) },
  metadata: { type: DataTypes.JSONB }
},{ tableName:'c2c_transactions', underscored:true, paranoid:true });
export default C2CTransaction;

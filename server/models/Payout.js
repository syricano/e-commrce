import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const Payout = sequelize.define('Payout', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  storeId: { type: DataTypes.BIGINT, allowNull:false },
  amount: { type: DataTypes.INTEGER, allowNull:false },
  currency: { type: DataTypes.STRING(3), allowNull:false, defaultValue:'EUR' },
  periodStart: { type: DataTypes.DATE, allowNull:false },
  periodEnd: { type: DataTypes.DATE, allowNull:false },
  status: { type: DataTypes.ENUM('pending','in_transit','paid','failed'), allowNull:false, defaultValue:'pending' },
  externalRef: { type: DataTypes.STRING(128) },
  fees: { type: DataTypes.JSONB },
  metadata: { type: DataTypes.JSONB }
},{ tableName:'payouts', underscored:true, paranoid:true });
export default Payout;

import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const Shipment = sequelize.define('Shipment', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  orderId: { type: DataTypes.BIGINT, allowNull:false },
  storeId: { type: DataTypes.BIGINT, allowNull:false },
  carrier: { type: DataTypes.STRING(80) },
  trackingNumber: { type: DataTypes.STRING(120) },
  status: { type: DataTypes.ENUM('pending','shipped','delivered','lost','returned'), allowNull:false, defaultValue:'pending' },
  shippedAt: { type: DataTypes.DATE },
  deliveredAt: { type: DataTypes.DATE }
},{ tableName:'shipments', underscored:true, paranoid:true });
export default Shipment;

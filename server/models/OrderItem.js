import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  orderId: { type: DataTypes.BIGINT, allowNull:false },
  offerId: { type: DataTypes.BIGINT, allowNull:true },
  // Merchant store offer (nullable when using offerId)
  storeOfferId: { type: DataTypes.BIGINT, allowNull:true },
  // C2C listing (nullable when using other refs)
  listingId: { type: DataTypes.BIGINT, allowNull:true },
  storeId: { type: DataTypes.BIGINT, allowNull:true },
  productSnapshotName: { type: DataTypes.STRING(255), allowNull:false },
  snapshotLocale: { type: DataTypes.STRING(5), allowNull:false, defaultValue:'ar' },
  unitPriceAmount: { type: DataTypes.INTEGER, allowNull:false },
  quantity: { type: DataTypes.INTEGER, allowNull:false },
  taxRatePct: { type: DataTypes.DECIMAL(6,3), allowNull:false, defaultValue:0.0 }
},{ tableName:'order_items', underscored:true, paranoid:true });
export default OrderItem;

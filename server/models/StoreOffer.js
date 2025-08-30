import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const StoreOffer = sequelize.define('StoreOffer', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  storeProductId: { type: DataTypes.BIGINT, allowNull: false },
  priceAmount: { type: DataTypes.INTEGER, allowNull: false },
  compareAtAmount: { type: DataTypes.INTEGER },
  currency: { type: DataTypes.STRING(3), allowNull:false, defaultValue: 'EUR' },
  stockOnHand: { type: DataTypes.INTEGER, allowNull:false, defaultValue: 0 },
  isActive: { type: DataTypes.BOOLEAN, allowNull:false, defaultValue: true },
}, { tableName: 'store_offers', underscored: true, paranoid: true });

export default StoreOffer;


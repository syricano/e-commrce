import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const StoreProductMedia = sequelize.define('StoreProductMedia', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  storeProductId: { type: DataTypes.BIGINT, allowNull: false },
  url: { type: DataTypes.STRING(1024), allowNull: false },
  type: { type: DataTypes.ENUM('image','video'), allowNull:false, defaultValue:'image' },
  position: { type: DataTypes.INTEGER, allowNull:false, defaultValue:0 },
  altText: { type: DataTypes.JSONB },
  metadata: { type: DataTypes.JSONB }
}, { tableName: 'store_product_media', underscored: true, paranoid: true });

export default StoreProductMedia;


import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const Product = sequelize.define('Product', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  canonicalSku: { type: DataTypes.STRING(64), unique: true },
  brandId: { type: DataTypes.BIGINT },
  defaultCategoryId: { type: DataTypes.BIGINT },
  gtin: { type: DataTypes.STRING(32) },
  taxClass: { type: DataTypes.STRING(32) },
  attributes: { type: DataTypes.JSONB },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  moderationStatus: { type: DataTypes.ENUM('draft','pending','approved','rejected'), allowNull: false, defaultValue: 'draft' },
  publishedAt: { type: DataTypes.DATE }
}, {
  tableName: 'products',
  underscored: true,
  paranoid: true
});

export default Product;

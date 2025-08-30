import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const StoreProduct = sequelize.define('StoreProduct', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  storeId: { type: DataTypes.BIGINT, allowNull: false },
  storeCategoryId: { type: DataTypes.BIGINT, allowNull: true },
  categoryId: { type: DataTypes.BIGINT, allowNull: true },
  articleNumber: { type: DataTypes.STRING(64), allowNull: false },
  name: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT },
  attributes: { type: DataTypes.JSONB },
  metadata: { type: DataTypes.JSONB },
}, { tableName: 'store_products', underscored: true, paranoid: true, indexes: [
  { unique: true, fields: ['store_id', 'article_number'] },
]});

export default StoreProduct;

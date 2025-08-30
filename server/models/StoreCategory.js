import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const StoreCategory = sequelize.define('StoreCategory', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  storeId: { type: DataTypes.BIGINT, allowNull: false },
  parentId: { type: DataTypes.BIGINT, allowNull: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  slug: { type: DataTypes.STRING(255), allowNull: false },
  position: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  fields: { type: DataTypes.JSONB },
}, { tableName: 'store_categories', underscored: true, paranoid: true, indexes: [
  { unique: true, fields: ['store_id', 'slug'] },
]});

export default StoreCategory;


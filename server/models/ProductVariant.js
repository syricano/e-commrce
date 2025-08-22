import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const ProductVariant = sequelize.define('ProductVariant', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  productId: { type: DataTypes.BIGINT, allowNull:false },
  variantSku: { type: DataTypes.STRING(64), allowNull:false, unique:true },
  barcode: { type: DataTypes.STRING(64) },
  options: { type: DataTypes.JSONB },
  weightGrams: { type: DataTypes.INTEGER },
  lengthMm: { type: DataTypes.INTEGER },
  widthMm: { type: DataTypes.INTEGER },
  heightMm: { type: DataTypes.INTEGER },
  isActive: { type: DataTypes.BOOLEAN, allowNull:false, defaultValue:true }
},{ tableName:'product_variants', underscored:true, paranoid:true });
export default ProductVariant;

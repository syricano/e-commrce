import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const ProductTranslation = sequelize.define('ProductTranslation', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  productId: { type: DataTypes.BIGINT, allowNull:false },
  locale: { type: DataTypes.STRING(5), allowNull:false },
  name: { type: DataTypes.STRING(255), allowNull:false },
  slug: { type: DataTypes.STRING(255), allowNull:false },
  shortDescription: { type: DataTypes.STRING(500) },
  longDescription: { type: DataTypes.TEXT },
  metaTitle: { type: DataTypes.STRING(255) },
  metaDescription: { type: DataTypes.STRING(500) }
},{ tableName:'product_translations', underscored:true, paranoid:true, indexes:[{ unique:true, fields:['product_id','locale'] },{ unique:true, fields:['slug','locale'] }]});
export default ProductTranslation;

import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const CategoryTranslation = sequelize.define('CategoryTranslation', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  categoryId: { type: DataTypes.BIGINT, allowNull: false },
  locale: { type: DataTypes.STRING(5), allowNull:false }, 
  name: { type: DataTypes.STRING(200), allowNull:false },
  slug: { type: DataTypes.STRING(255), allowNull:false },
  metaTitle: { type: DataTypes.STRING(255) },
  metaDescription: { type: DataTypes.STRING(500) }
},{ tableName:'category_translations', underscored:true, paranoid:true, indexes:[{ unique:true, fields:['category_id','locale'] },{ unique:true, fields:['slug','locale'] }]});
export default CategoryTranslation;

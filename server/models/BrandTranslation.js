import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const BrandTranslation = sequelize.define('BrandTranslation', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  brandId: { type: DataTypes.BIGINT, allowNull: false },
  locale: { type: DataTypes.STRING(5), allowNull:false },
  name: { type: DataTypes.STRING(200), allowNull:false },
  slug: { type: DataTypes.STRING(255), allowNull:false }
},{ tableName:'brand_translations', underscored:true, paranoid:true, indexes:[{ unique:true, fields:['brand_id','locale'] },{ unique:true, fields:['slug','locale'] }]});
export default BrandTranslation;

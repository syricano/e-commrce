import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const ListingTranslation = sequelize.define('ListingTranslation', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  listingId: { type: DataTypes.BIGINT, allowNull: false },
  locale: { type: DataTypes.STRING(5), allowNull:false, defaultValue:'ar' },
  title: { type: DataTypes.STRING(255), allowNull:false },
  slug: { type: DataTypes.STRING(255), allowNull:false },
  description: { type: DataTypes.TEXT }
},{ tableName:'listing_translations', underscored:true, paranoid:true, indexes:[
  { unique:true, fields:['listing_id','locale'] },
  { unique:true, fields:['slug','locale'] }
]});

export default ListingTranslation;

import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const CollectionTranslation = sequelize.define('CollectionTranslation', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  collectionId: { type: DataTypes.BIGINT, allowNull:false },
  locale: { type: DataTypes.STRING(5), allowNull:false },
  title: { type: DataTypes.STRING(200), allowNull:false },
  slug: { type: DataTypes.STRING(255), allowNull:false },
  subtitle: { type: DataTypes.STRING(255) }
},{ tableName:'collection_translations', underscored:true, paranoid:true, indexes:[{ unique:true, fields:['collection_id','locale'] },{ unique:true, fields:['slug','locale'] }]});
export default CollectionTranslation;

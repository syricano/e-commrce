import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const CollectionRule = sequelize.define('CollectionRule', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  collectionId: { type: DataTypes.BIGINT, allowNull:false },
  query: { type: DataTypes.JSONB, allowNull:false }
},{ tableName:'collection_rules', underscored:true, paranoid:true });
export default CollectionRule;

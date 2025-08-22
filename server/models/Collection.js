import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const Collection = sequelize.define('Collection', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  key: { type: DataTypes.STRING(120), allowNull:false, unique:true },
  type: { type: DataTypes.ENUM('manual','rule'), allowNull:false, defaultValue:'manual' },
  isActive: { type: DataTypes.BOOLEAN, allowNull:false, defaultValue:true },
  metadata: { type: DataTypes.JSONB }
},{ tableName:'collections', underscored:true, paranoid:true });
export default Collection;

import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const Brand = sequelize.define('Brand', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  isActive: { type: DataTypes.BOOLEAN, allowNull:false, defaultValue:true },
  metadata: { type: DataTypes.JSONB }
},{ tableName:'brands', underscored:true, paranoid:true });
export default Brand;

import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const Category = sequelize.define('Category', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  parentId: { type: DataTypes.BIGINT },
  position: { type: DataTypes.INTEGER, allowNull:false, defaultValue:0 },
  isActive: { type: DataTypes.BOOLEAN, allowNull:false, defaultValue:true },
  metadata: { type: DataTypes.JSONB }
},{ tableName:'categories', underscored:true, paranoid:true });
export default Category;

import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const CommissionScheme = sequelize.define('CommissionScheme', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(120), allowNull:false },
  type: { type: DataTypes.ENUM('percent','flat','tiered'), allowNull:false, defaultValue:'percent' },
  value: { type: DataTypes.DECIMAL(8,4), allowNull:false, defaultValue:0.1000 },
  overrides: { type: DataTypes.JSONB },
  effectiveFrom: { type: DataTypes.DATE },
  effectiveTo: { type: DataTypes.DATE }
},{ tableName:'commission_schemes', underscored:true, paranoid:true });
export default CommissionScheme;

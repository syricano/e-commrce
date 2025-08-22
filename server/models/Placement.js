import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const Placement = sequelize.define('Placement', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  slot: { type: DataTypes.STRING(120), allowNull:false },
  collectionId: { type: DataTypes.BIGINT, allowNull:false },
  position: { type: DataTypes.INTEGER, allowNull:false, defaultValue:0 },
  localeVisibility: { type: DataTypes.ARRAY(DataTypes.STRING(5)) }
},{ tableName:'placements', underscored:true, paranoid:true });
export default Placement;

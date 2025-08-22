import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const Inventory = sequelize.define('Inventory', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  offerId: { type: DataTypes.BIGINT, allowNull:false, unique:true },
  stockOnHand: { type: DataTypes.INTEGER, allowNull:false, defaultValue:0 },
  stockReserved: { type: DataTypes.INTEGER, allowNull:false, defaultValue:0 },
  reorderPoint: { type: DataTypes.INTEGER, defaultValue:0 },
  backorderPolicy: { type: DataTypes.ENUM('deny','allow'), allowNull:false, defaultValue:'deny' }
},{ tableName:'inventory', underscored:true, paranoid:true });
export default Inventory;

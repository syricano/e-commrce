import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.BIGINT, allowNull:false },
  type: { type: DataTypes.STRING(64), allowNull:false },
  data: { type: DataTypes.JSONB },
  readAt: { type: DataTypes.DATE }
},{ tableName:'notifications', underscored:true, paranoid:true });
export default Notification;

import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const BlockedUser = sequelize.define('BlockedUser', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.BIGINT, allowNull:false },
  blockedUserId: { type: DataTypes.BIGINT, allowNull:false }
},{ tableName:'blocked_users', underscored:true, paranoid:true, indexes:[{ unique:true, fields:['user_id','blocked_user_id'] }] });
export default BlockedUser;

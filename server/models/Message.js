import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const Message = sequelize.define('Message', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  threadId: { type: DataTypes.BIGINT, allowNull:false },
  senderUserId: { type: DataTypes.BIGINT, allowNull:false },
  body: { type: DataTypes.TEXT, allowNull:false },
  attachments: { type: DataTypes.JSONB },
  readAt: { type: DataTypes.DATE },
  deliveredAt: { type: DataTypes.DATE }
},{ tableName:'messages', underscored:true, paranoid:true });

export default Message;

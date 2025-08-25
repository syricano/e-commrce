import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const MessageThread = sequelize.define('MessageThread', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  listingId: { type: DataTypes.BIGINT, allowNull:false },
  buyerUserId: { type: DataTypes.BIGINT, allowNull:false },
  sellerUserId: { type: DataTypes.BIGINT, allowNull:false },
  lastMessageAt: { type: DataTypes.DATE },
  status: { type: DataTypes.ENUM('open','archived','blocked'), allowNull:false, defaultValue:'open' }
},{ tableName:'message_threads', underscored:true, paranoid:true, indexes:[
  { unique:true, fields:['listing_id','buyer_user_id','seller_user_id'] }
]});

export default MessageThread;

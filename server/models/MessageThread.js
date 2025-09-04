import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const MessageThread = sequelize.define('MessageThread', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  // Backward-compatible: listing context (nullable once context fields exist)
  listingId: { type: DataTypes.BIGINT, allowNull: true },
  // Generic context for future: store/order/direct, etc.
  contextType: { type: DataTypes.ENUM('listing', 'store', 'order', 'direct'), allowNull: false, defaultValue: 'listing' },
  contextId: { type: DataTypes.BIGINT, allowNull: true },
  buyerUserId: { type: DataTypes.BIGINT, allowNull:false },
  sellerUserId: { type: DataTypes.BIGINT, allowNull:false },
  lastMessageAt: { type: DataTypes.DATE },
  status: { type: DataTypes.ENUM('open','archived','blocked'), allowNull:false, defaultValue:'open' }
},{ tableName:'message_threads', underscored:true, paranoid:true, indexes:[
  { unique:true, fields:['listing_id','buyer_user_id','seller_user_id'] },
  { fields:['context_type','context_id'] }
]});

export default MessageThread;

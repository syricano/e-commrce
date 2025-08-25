import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const UserRating = sequelize.define('UserRating', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  transactionId: { type: DataTypes.BIGINT, allowNull:false },
  raterUserId: { type: DataTypes.BIGINT, allowNull:false },
  rateeUserId: { type: DataTypes.BIGINT, allowNull:false },
  role: { type: DataTypes.ENUM('buyer','seller'), allowNull:false },
  stars: { type: DataTypes.INTEGER, allowNull:false },
  comment: { type: DataTypes.TEXT }
},{ tableName:'user_ratings', underscored:true, paranoid:true, indexes:[{ unique:true, fields:['transaction_id','rater_user_id'] }] });
export default UserRating;

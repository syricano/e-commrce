import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const ReviewVote = sequelize.define('ReviewVote', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  reviewId: { type: DataTypes.BIGINT, allowNull:false },
  userId: { type: DataTypes.BIGINT, allowNull:false },
  value: { type: DataTypes.ENUM('up','down'), allowNull:false, defaultValue:'up' }
},{ tableName:'review_votes', underscored:true, paranoid:true, indexes:[{ unique:true, fields:['review_id','user_id'] }]});
export default ReviewVote;

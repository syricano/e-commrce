import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const Review = sequelize.define('Review', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.BIGINT, allowNull:false },
  productId: { type: DataTypes.BIGINT, allowNull:false },
  storeId: { type: DataTypes.BIGINT },
  rating: { type: DataTypes.INTEGER, allowNull:false },
  title: { type: DataTypes.STRING(200) },
  body: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('pending','approved','rejected'), allowNull:false, defaultValue:'pending' }
},{ tableName:'reviews', underscored:true, paranoid:true });
export default Review;

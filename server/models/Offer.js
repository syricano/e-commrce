import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const Offer = sequelize.define('Offer', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  storeId: { type: DataTypes.BIGINT, allowNull:false },
  variantId: { type: DataTypes.BIGINT, allowNull:false },
  condition: { type: DataTypes.ENUM('new','used','refurbished'), allowNull:false, defaultValue:'new' },
  priceAmount: { type: DataTypes.INTEGER, allowNull:false },
  compareAtAmount: { type: DataTypes.INTEGER },
  currency: { type: DataTypes.STRING(3), allowNull:false, defaultValue:'EUR' },
  minQty: { type: DataTypes.INTEGER, allowNull:false, defaultValue:1 },
  maxQty: { type: DataTypes.INTEGER },
  leadTimeDays: { type: DataTypes.INTEGER, defaultValue:0 },
  isActive: { type: DataTypes.BOOLEAN, allowNull:false, defaultValue:true }
},{ tableName:'offers', underscored:true, paranoid:true, indexes:[{ unique:true, fields:['store_id','variant_id'] }]});
export default Offer;

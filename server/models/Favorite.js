import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const Favorite = sequelize.define('Favorite', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.BIGINT, allowNull:false },
  listingId: { type: DataTypes.BIGINT, allowNull:false }
},{ tableName:'favorites', underscored:true, paranoid:true, indexes:[
  { unique:true, fields:['user_id','listing_id'] }
]});

export default Favorite;

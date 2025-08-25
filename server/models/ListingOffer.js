import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const ListingOffer = sequelize.define('ListingOffer', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  listingId: { type: DataTypes.BIGINT, allowNull:false },
  buyerUserId: { type: DataTypes.BIGINT, allowNull:false },
  amount: { type: DataTypes.INTEGER, allowNull:false },
  status: { type: DataTypes.ENUM('open','accepted','declined','withdrawn','expired'), allowNull:false, defaultValue:'open' },
  message: { type: DataTypes.TEXT }
},{ tableName:'listing_offers', underscored:true, paranoid:true, indexes:[
  { fields:['listing_id','buyer_user_id','status'] }
]});

export default ListingOffer;

import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const ListingMedia = sequelize.define('ListingMedia', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  listingId: { type: DataTypes.BIGINT, allowNull:false },
  url: { type: DataTypes.STRING(1024), allowNull:false },
  type: { type: DataTypes.ENUM('image','video'), allowNull:false, defaultValue:'image' },
  position: { type: DataTypes.INTEGER, allowNull:false, defaultValue:0 },
  altText: { type: DataTypes.JSONB },
  metadata: { type: DataTypes.JSONB }
},{ tableName:'listing_media', underscored:true, paranoid:true });

export default ListingMedia;

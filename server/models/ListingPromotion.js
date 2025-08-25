import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const ListingPromotion = sequelize.define('ListingPromotion', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  listingId: { type: DataTypes.BIGINT, allowNull:false },
  type: { type: DataTypes.ENUM('bump','spotlight'), allowNull:false, defaultValue:'bump' },
  status: { type: DataTypes.ENUM('pending','active','expired','cancelled'), allowNull:false, defaultValue:'active' },
  startAt: { type: DataTypes.DATE },
  endAt: { type: DataTypes.DATE },
  chargeId: { type: DataTypes.STRING(128) },
  metadata: { type: DataTypes.JSONB }
},{ tableName:'listing_promotions', underscored:true, paranoid:true });
export default ListingPromotion;

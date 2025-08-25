import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const Listing = sequelize.define('Listing', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  ownerUserId: { type: DataTypes.BIGINT, allowNull: false },
  categoryId: { type: DataTypes.BIGINT },
  priceAmount: { type: DataTypes.INTEGER, allowNull: false },
  currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'EUR' },
  negotiable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  condition: { type: DataTypes.ENUM('new','used','refurbished'), allowNull: false, defaultValue: 'used' },
  status: { type: DataTypes.ENUM('draft','active','reserved','sold','expired'), allowNull: false, defaultValue: 'draft' },
  locationCity: { type: DataTypes.STRING(120) },
  locationLat: { type: DataTypes.DECIMAL(9,6) },
  locationLng: { type: DataTypes.DECIMAL(9,6) },
  views: { type: DataTypes.INTEGER, allowNull:false, defaultValue:0 },
  favoritesCount: { type: DataTypes.INTEGER, allowNull:false, defaultValue:0 },
  publishedAt: { type: DataTypes.DATE },
  expiresAt: { type: DataTypes.DATE },
  metadata: { type: DataTypes.JSONB }
},{ tableName:'listings', underscored:true, paranoid:true });

export default Listing;

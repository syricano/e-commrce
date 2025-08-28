import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const Listing = sequelize.define(
  'Listing',
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    ownerUserId: { type: DataTypes.BIGINT, allowNull: false },
    categoryId: { type: DataTypes.BIGINT, allowNull: true },
    priceAmount: { type: DataTypes.INTEGER, allowNull: false },
    currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'EUR' },
    negotiable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    condition: {
      type: DataTypes.ENUM('new', 'used', 'refurbished'),
      allowNull: false,
      defaultValue: 'used',
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'reserved', 'sold', 'expired'),
      allowNull: false,
      defaultValue: 'draft',
    },
    reservedAt: { type: DataTypes.DATE, allowNull: true },
    publishedAt: { type: DataTypes.DATE, allowNull: true },
    locationCity: { type: DataTypes.STRING(120), allowNull: true },
    locationLat: { type: DataTypes.DECIMAL(9, 6), allowNull: true },
    locationLng: { type: DataTypes.DECIMAL(9, 6), allowNull: true },
    type: { type: DataTypes.ENUM('private', 'store'), allowNull: false, defaultValue: 'private' },
    allowCheckout: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    // keep existing extras
    views: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    favoritesCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    expiresAt: { type: DataTypes.DATE },
    metadata: { type: DataTypes.JSONB },
  },
  { tableName: 'listings', underscored: true, paranoid: true }
);

export default Listing;

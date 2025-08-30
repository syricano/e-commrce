import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const Store = sequelize.define('Store', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  ownerUserId: { type: DataTypes.BIGINT, allowNull: false },
  name: { type: DataTypes.STRING(200), allowNull: false },
  slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  email: { type: DataTypes.STRING(320) },
  phone: { type: DataTypes.STRING(64) },
  country: { type: DataTypes.STRING(100) },
  city: { type: DataTypes.STRING(120) },
  address: { type: DataTypes.STRING(500) },
  logoUrl: { type: DataTypes.STRING(1024) },
  coverUrl: { type: DataTypes.STRING(1024) },
  status: { type: DataTypes.ENUM('pending','active','suspended'), allowNull:false, defaultValue:'pending' },
  commissionSchemeId: { type: DataTypes.BIGINT },
  preferredPayments: { type: DataTypes.JSONB },
  shippingOptions: { type: DataTypes.JSONB },
  invoiceEmail: { type: DataTypes.STRING(320) },
  autoInvoice: { type: DataTypes.BOOLEAN, allowNull:false, defaultValue:false },
  kycData: { type: DataTypes.JSONB },
  metadata: { type: DataTypes.JSONB }
},{ tableName:'stores', underscored:true, paranoid:true });
export default Store;

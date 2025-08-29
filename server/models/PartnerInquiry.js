import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const PartnerInquiry = sequelize.define('PartnerInquiry', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  email: { type: DataTypes.STRING(320), allowNull: false },
  phone: { type: DataTypes.STRING(64) },
  businessField: { type: DataTypes.STRING(255) },
  country: { type: DataTypes.STRING(100) },
  city: { type: DataTypes.STRING(120) },
  address: { type: DataTypes.STRING(500) },
  shippingOptions: { type: DataTypes.JSONB },
  preferredPayments: { type: DataTypes.JSONB },
  message: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('new','reviewed'), allowNull: false, defaultValue: 'new' },
},{ tableName:'partner_inquiries', underscored:true, paranoid:true });

export default PartnerInquiry;

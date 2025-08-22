import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const Address = sequelize.define('Address', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.BIGINT, allowNull: false },
  fullName: { type: DataTypes.STRING(160), allowNull: false },
  phone: { type: DataTypes.STRING(32), allowNull: false },
  country: { type: DataTypes.STRING(2), allowNull: false },
  city: { type: DataTypes.STRING(120), allowNull: false },
  street: { type: DataTypes.STRING(255), allowNull: false },
  postalCode: { type: DataTypes.STRING(16) },
  isDefault: { type: DataTypes.BOOLEAN, allowNull:false, defaultValue:false },
  metadata: { type: DataTypes.JSONB }
},{ tableName:'addresses', underscored:true, paranoid:true });
export default Address;

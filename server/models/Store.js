import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const Store = sequelize.define('Store', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  ownerUserId: { type: DataTypes.BIGINT, allowNull: false },
  name: { type: DataTypes.STRING(200), allowNull: false },
  slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  logoUrl: { type: DataTypes.STRING(1024) },
  coverUrl: { type: DataTypes.STRING(1024) },
  status: { type: DataTypes.ENUM('pending','active','suspended'), allowNull:false, defaultValue:'pending' },
  commissionSchemeId: { type: DataTypes.BIGINT },
  kycData: { type: DataTypes.JSONB },
  metadata: { type: DataTypes.JSONB }
},{ tableName:'stores', underscored:true, paranoid:true });
export default Store;

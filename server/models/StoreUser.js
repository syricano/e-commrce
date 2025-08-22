import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const StoreUser = sequelize.define('StoreUser', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  storeId: { type: DataTypes.BIGINT, allowNull: false },
  userId: { type: DataTypes.BIGINT, allowNull: false },
  role: { type: DataTypes.ENUM('owner','manager','staff'), allowNull:false, defaultValue:'staff' },
  status: { type: DataTypes.ENUM('active','revoked'), allowNull:false, defaultValue:'active' }
},{ tableName:'store_users', underscored:true, paranoid:true });
export default StoreUser;

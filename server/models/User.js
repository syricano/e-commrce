import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const User = sequelize.define('User', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  email: { type: DataTypes.STRING(320), allowNull: false, unique: true },
  phone: { type: DataTypes.STRING(32) },
  firstName: { type: DataTypes.STRING(120) },
  lastName: { type: DataTypes.STRING(120) },
  passwordHash: { type: DataTypes.STRING(255) },
  oauthProvider: { type: DataTypes.STRING(32) },
  oauthSubject: { type: DataTypes.STRING(191) },
  role: { type: DataTypes.ENUM('customer','seller','staff','admin'), allowNull: false, defaultValue: 'customer' },
  status: { type: DataTypes.ENUM('active','suspended','pending'), allowNull: false, defaultValue: 'active' },
  metadata: { type: DataTypes.JSONB }
}, {
  tableName: 'users',
  underscored: true,
  paranoid: true
});

export default User;

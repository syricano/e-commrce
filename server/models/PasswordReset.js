import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const PasswordReset = sequelize.define('PasswordReset', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.BIGINT, allowNull: false },
  tokenHash: { type: DataTypes.STRING(128), allowNull: false, unique: true },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  usedAt: { type: DataTypes.DATE },
  ip: { type: DataTypes.STRING(64) },
  userAgent: { type: DataTypes.STRING(512) }
}, { tableName: 'password_resets', underscored: true, paranoid: true, indexes: [{ fields: ['user_id'] }, { unique: true, fields: ['token_hash'] }] });

export default PasswordReset;

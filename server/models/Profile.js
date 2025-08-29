import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const Profile = sequelize.define('Profile', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.BIGINT, allowNull: false, unique: true },
  displayName: { type: DataTypes.STRING(120) },
  avatarUrl: { type: DataTypes.STRING(1024) },
  bio: { type: DataTypes.TEXT },
  birthday: { type: DataTypes.DATE },
  gender: { type: DataTypes.ENUM('male','female','other') },
  locale: { type: DataTypes.STRING(5), allowNull: false, defaultValue: 'ar' },
  timezone: { type: DataTypes.STRING(64) },
  social: { type: DataTypes.JSONB } // e.g. { twitter:'...', instagram:'...' }
}, { tableName:'profiles', underscored:true, paranoid:true });

export default Profile;

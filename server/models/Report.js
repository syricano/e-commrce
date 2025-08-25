import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const Report = sequelize.define('Report', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  listingId: { type: DataTypes.BIGINT, allowNull:false },
  reporterUserId: { type: DataTypes.BIGINT, allowNull:false },
  reason: { type: DataTypes.ENUM('spam','prohibited','fraud','other'), allowNull:false },
  details: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('open','reviewed','actioned'), allowNull:false, defaultValue:'open' },
  resolvedAt: { type: DataTypes.DATE }
},{ tableName:'reports', underscored:true, paranoid:true });

export default Report;

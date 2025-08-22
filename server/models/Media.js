import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const Media = sequelize.define('Media', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  productId: { type: DataTypes.BIGINT },
  variantId: { type: DataTypes.BIGINT },
  url: { type: DataTypes.STRING(1024), allowNull:false },
  type: { type: DataTypes.ENUM('image','video'), allowNull:false, defaultValue:'image' },
  position: { type: DataTypes.INTEGER, allowNull:false, defaultValue:0 },
  altText: { type: DataTypes.JSONB },
  metadata: { type: DataTypes.JSONB }
},{ tableName:'media', underscored:true, paranoid:true });
export default Media;

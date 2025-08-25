import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const SavedSearch = sequelize.define('SavedSearch', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.BIGINT, allowNull:false },
  title: { type: DataTypes.STRING(200) },
  query: { type: DataTypes.JSONB, allowNull:false },
  lat: { type: DataTypes.DECIMAL(9,6) },
  lng: { type: DataTypes.DECIMAL(9,6) },
  radiusKm: { type: DataTypes.INTEGER },
  isActive: { type: DataTypes.BOOLEAN, allowNull:false, defaultValue:true }
},{ tableName:'saved_searches', underscored:true, paranoid:true });
export default SavedSearch;

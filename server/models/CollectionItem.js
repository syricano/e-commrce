import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const CollectionItem = sequelize.define('CollectionItem', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  collectionId: { type: DataTypes.BIGINT, allowNull: false },
  kind: {
    type: DataTypes.ENUM('storeOffer', 'product', 'listing'),
    allowNull: false,
    defaultValue: 'storeOffer',
  },
  refId: { type: DataTypes.BIGINT, allowNull: false },
  rank: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  pinned: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  metadata: { type: DataTypes.JSONB },
}, {
  tableName: 'collection_items',
  underscored: true,
  paranoid: true,
  indexes: [
    { fields: ['collection_id', 'rank'] },
    { unique: true, fields: ['collection_id', 'kind', 'ref_id'] },
    { fields: ['collection_id', 'pinned'] },
  ],
});

export default CollectionItem;

// type: module
import { DataTypes } from 'sequelize';

/** @type {import('umzug').MigrationFn<{ context: import('sequelize').QueryInterface }>} */
export const up = async ({ context: q }) => {
  await q.createTable('store_offers', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: q.sequelize.fn('NOW') },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: q.sequelize.fn('NOW') },
    deleted_at: { type: DataTypes.DATE, allowNull: true },
  });
};

/** @type {import('umzug').MigrationFn<{ context: import('sequelize').QueryInterface }>} */
export const down = async ({ context: q }) => {
  await q.dropTable('store_offers');
};

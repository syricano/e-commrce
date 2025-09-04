// server/migrations/base__create_collection_items.js
// type: module
import { DataTypes } from 'sequelize';

/** @type {import('umzug').MigrationFn<{ context: import('sequelize').QueryInterface }>} */
export const up = async ({ context: q }) => {
  // create table only if missing
  const [[{ exists }]] = await q.sequelize.query(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema='public' AND table_name='collection_items'
    ) AS exists;
  `);

  if (!exists) {
    await q.createTable('collection_items', {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },

      collection_id: { type: DataTypes.BIGINT, allowNull: false },
      kind: { type: DataTypes.ENUM('storeOffer', 'product', 'listing'), allowNull: false, defaultValue: 'storeOffer' },
      ref_id: { type: DataTypes.BIGINT, allowNull: false },

      rank: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      pinned: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },

      metadata: { type: DataTypes.JSONB, allowNull: true },

      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: q.sequelize.fn('NOW') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: q.sequelize.fn('NOW') },
      deleted_at: { type: DataTypes.DATE, allowNull: true },
    });
  }

  // add indexes only if missing
  const idx = await q.showIndex('collection_items').catch(() => []);
  const has = (name) => idx.some(i => i.name === name);

  if (!has('collection_items_collection_id_rank')) {
    await q.addIndex('collection_items', ['collection_id', 'rank'], {
      name: 'collection_items_collection_id_rank',
    });
  }
  if (!has('collection_items_collection_id_pinned')) {
    await q.addIndex('collection_items', ['collection_id', 'pinned'], {
      name: 'collection_items_collection_id_pinned',
    });
  }
  if (!has('collection_items_collection_id_kind_ref_id')) {
    await q.addIndex('collection_items', ['collection_id', 'kind', 'ref_id'], {
      name: 'collection_items_collection_id_kind_ref_id',
      unique: true,
    });
  }
};

/** @type {import('umzug').MigrationFn<{ context: import('sequelize').QueryInterface }>} */
export const down = async ({ context: q }) => {
  // drop indexes if present
  await q.removeIndex('collection_items', 'collection_items_collection_id_kind_ref_id').catch(() => {});
  await q.removeIndex('collection_items', 'collection_items_collection_id_rank').catch(() => {});
  await q.removeIndex('collection_items', 'collection_items_collection_id_pinned').catch(() => {});

  // drop table if exists
  await q.sequelize.query('DROP TABLE IF EXISTS "collection_items";');

  // drop enum type if exists (Postgres)
  if (q.sequelize.getDialect() === 'postgres') {
    await q.sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_collection_items_kind') THEN
          DROP TYPE "enum_collection_items_kind";
        END IF;
      END$$;
    `);
  }
};

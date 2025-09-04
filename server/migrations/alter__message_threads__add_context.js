// type: module
import { DataTypes } from 'sequelize';

/** @type {import('umzug').MigrationFn<{ context: import('sequelize').QueryInterface }>} */
export const up = async ({ context: q }) => {
  // Add generic context columns
  await q.addColumn('message_threads', 'context_type', {
    type: DataTypes.ENUM('listing', 'store', 'order', 'direct'),
    allowNull: false,
    defaultValue: 'listing',
  });
  await q.addColumn('message_threads', 'context_id', {
    type: DataTypes.BIGINT,
    allowNull: true,
  });

  // Relax NOT NULL on listing_id to allow non-listing threads
  await q.changeColumn('message_threads', 'listing_id', {
    type: DataTypes.BIGINT,
    allowNull: true,
  });

  // Optional supporting index for context lookup
  await q.addIndex('message_threads', ['context_type', 'context_id'], {
    name: 'idx_message_threads_context',
    unique: false,
  });
};

/** @type {import('umzug').MigrationFn<{ context: import('sequelize').QueryInterface }>} */
export const down = async ({ context: q }) => {
  // Remove context index and columns
  try { await q.removeIndex('message_threads', 'idx_message_threads_context'); } catch {}

  // Revert listing_id to NOT NULL (may fail if data exists without listing)
  await q.changeColumn('message_threads', 'listing_id', {
    type: DataTypes.BIGINT,
    allowNull: false,
  });

  // Drop enum column must precede dropping type if needed
  await q.removeColumn('message_threads', 'context_id');
  await q.removeColumn('message_threads', 'context_type');
};


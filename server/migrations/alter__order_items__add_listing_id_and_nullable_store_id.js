// Adds listing_id to order_items and makes store_id nullable
// type: module
/** @type {import('umzug').MigrationFn<{ context: import('sequelize').QueryInterface }>} */
export const up = async ({ context: qi }) => {
  await qi.sequelize.query(`DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='order_items' AND column_name='listing_id'
    ) THEN
      ALTER TABLE public.order_items ADD COLUMN listing_id BIGINT NULL;
    END IF;
  END$$;`);

  await qi.sequelize.query(`ALTER TABLE public.order_items ALTER COLUMN store_id DROP NOT NULL;`);
};

/** @type {import('umzug').MigrationFn<{ context: import('sequelize').QueryInterface }>} */
export const down = async ({ context: qi }) => {
  await qi.sequelize.query(`ALTER TABLE public.order_items DROP COLUMN IF EXISTS listing_id;`);
  await qi.sequelize.query(`
    DO $$
    BEGIN
      BEGIN
        PERFORM 1;
        EXECUTE 'ALTER TABLE public.order_items ALTER COLUMN store_id SET NOT NULL';
      EXCEPTION WHEN OTHERS THEN
        NULL; -- ignore if data prevents
      END;
    END $$;
  `);
};

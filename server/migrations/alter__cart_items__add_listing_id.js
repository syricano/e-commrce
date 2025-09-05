// Adds listing_id to cart_items and unique partial index
// type: module
/** @type {import('umzug').MigrationFn<{ context: import('sequelize').QueryInterface }>} */
export const up = async ({ context: qi }) => {
  const table = 'cart_items';
  const col = 'listing_id';
  await qi.sequelize.query(`DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='${table}' AND column_name='${col}'
    ) THEN
      ALTER TABLE public.${table} ADD COLUMN ${col} BIGINT NULL;
    END IF;
  END$$;`);

  await qi.sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='cart_items_cart_id_listing_id_uniq'
      ) THEN
        CREATE UNIQUE INDEX cart_items_cart_id_listing_id_uniq
        ON public.cart_items (cart_id, listing_id)
        WHERE deleted_at IS NULL AND listing_id IS NOT NULL;
      END IF;
    END$$;
  `);
};

/** @type {import('umzug').MigrationFn<{ context: import('sequelize').QueryInterface }>} */
export const down = async ({ context: qi }) => {
  await qi.sequelize.query(`DROP INDEX IF EXISTS public.cart_items_cart_id_listing_id_uniq;`);
  await qi.sequelize.query(`ALTER TABLE public.cart_items DROP COLUMN IF EXISTS listing_id;`);
};

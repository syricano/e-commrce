// type: module
/** @type {import('umzug').MigrationFn<{ context: import('sequelize').QueryInterface }>} */
export const up = async ({ context: q }) => {
  await q.sequelize.query(`
  DO $$
  BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema='public' AND table_name='store_products'
    ) THEN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='store_products' AND column_name='category_id'
      ) THEN
        ALTER TABLE public.store_products ADD COLUMN category_id BIGINT;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname='store_products_category_id_idx'
      ) THEN
        CREATE INDEX store_products_category_id_idx ON public.store_products (category_id);
      END IF;
    ELSE
      RAISE NOTICE 'store_products missing; skipping alter__store_products__add_store_offer_id.';
    END IF;
  END
  $$;`);
};

/** @type {import('umzug').MigrationFn<{ context: import('sequelize').QueryInterface }>} */
export const down = async ({ context: q }) => {
  await q.sequelize.query(`
  DO $$
  BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='store_products' AND column_name='category_id'
    ) THEN
      BEGIN
        PERFORM 1 FROM pg_class WHERE relname='store_products_category_id_idx';
        IF FOUND THEN
          DROP INDEX public.store_products_category_id_idx;
        END IF;
      EXCEPTION WHEN undefined_table THEN
        -- ignore
      END;
      ALTER TABLE public.store_products DROP COLUMN category_id;
    END IF;
  END
  $$;`);
};

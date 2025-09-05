// type: module
/** @type {import('umzug').MigrationFn<{ context: import('sequelize').QueryInterface }>} */
export const up = async ({ context: q }) => {
  await q.sequelize.query(`
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='orders' AND column_name='lookup_token'
    ) THEN
      ALTER TABLE public.orders ADD COLUMN lookup_token TEXT;
      CREATE INDEX IF NOT EXISTS orders_lookup_token_idx ON public.orders (lookup_token);
    END IF;
  END$$;`);
};

/** @type {import('umzug').MigrationFn<{ context: import('sequelize').QueryInterface }>} */
export const down = async ({ context: q }) => {
  await q.sequelize.query(`
    DROP INDEX IF EXISTS public.orders_lookup_token_idx;
    ALTER TABLE public.orders DROP COLUMN IF EXISTS lookup_token;
  `);
};


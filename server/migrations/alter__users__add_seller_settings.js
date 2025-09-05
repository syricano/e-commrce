// type: module
/** @type {import('umzug').MigrationFn<{ context: import('sequelize').QueryInterface }>} */
export const up = async ({ context: q }) => {
  await q.sequelize.query(`
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='users' AND column_name='seller_shipping_options'
    ) THEN
      ALTER TABLE public.users ADD COLUMN seller_shipping_options JSONB;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='users' AND column_name='seller_preferred_payments'
    ) THEN
      ALTER TABLE public.users ADD COLUMN seller_preferred_payments JSONB;
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
      WHERE table_schema='public' AND table_name='users' AND column_name='seller_preferred_payments'
    ) THEN
      ALTER TABLE public.users DROP COLUMN seller_preferred_payments;
    END IF;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='users' AND column_name='seller_shipping_options'
    ) THEN
      ALTER TABLE public.users DROP COLUMN seller_shipping_options;
    END IF;
  END
  $$;`);
};


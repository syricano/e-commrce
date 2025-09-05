// type: module
/** @type {import('umzug').MigrationFn<{ context: import('sequelize').QueryInterface }>} */
export const up = async ({ context: q }) => {
  await q.sequelize.query(`
  DO $$
  DECLARE has_orders boolean;
  BEGIN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema='public' AND table_name='orders'
    ) INTO has_orders;
    IF NOT has_orders THEN
      RAISE NOTICE 'orders missing; skipping alter__orders__add_checkout_fields.';
      RETURN;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='orders' AND column_name='shipping_data'
    ) THEN
      ALTER TABLE public.orders ADD COLUMN shipping_data JSONB;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='orders' AND column_name='payment_data'
    ) THEN
      ALTER TABLE public.orders ADD COLUMN payment_data JSONB;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='orders' AND column_name='customer_note'
    ) THEN
      ALTER TABLE public.orders ADD COLUMN customer_note TEXT;
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
      WHERE table_schema='public' AND table_name='orders' AND column_name='customer_note'
    ) THEN
      ALTER TABLE public.orders DROP COLUMN customer_note;
    END IF;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='orders' AND column_name='payment_data'
    ) THEN
      ALTER TABLE public.orders DROP COLUMN payment_data;
    END IF;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='orders' AND column_name='shipping_data'
    ) THEN
      ALTER TABLE public.orders DROP COLUMN shipping_data;
    END IF;
  END
  $$;`);
};


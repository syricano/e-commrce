// type: module
/** @type {import('umzug').MigrationFn<{ context: import('sequelize').QueryInterface }>} */
export const up = async ({ context: q }) => {
  await q.sequelize.query(`
  DO $$
  DECLARE has_items boolean;
  DECLARE has_store_offers boolean;
  BEGIN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema='public' AND table_name='order_items'
    ) INTO has_items;
    IF NOT has_items THEN
      RAISE NOTICE 'order_items missing; skipping alter__order_items__add_store_offer_id.';
      RETURN;
    END IF;

    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema='public' AND table_name='store_offers'
    ) INTO has_store_offers;

    -- Make offer_id nullable
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='order_items' AND column_name='offer_id' AND is_nullable='NO'
    ) THEN
      ALTER TABLE public.order_items ALTER COLUMN offer_id DROP NOT NULL;
    END IF;

    -- Add store_offer_id
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='order_items' AND column_name='store_offer_id'
    ) THEN
      ALTER TABLE public.order_items ADD COLUMN store_offer_id BIGINT;
    END IF;

    -- FK
    IF has_store_offers AND NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_schema='public' AND table_name='order_items' AND constraint_name='order_items_store_offer_id_fkey'
    ) THEN
      ALTER TABLE public.order_items
        ADD CONSTRAINT order_items_store_offer_id_fkey
        FOREIGN KEY (store_offer_id) REFERENCES public.store_offers(id)
        ON UPDATE CASCADE ON DELETE SET NULL;
    END IF;

    -- XOR constraint
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_schema='public' AND table_name='order_items' AND constraint_name='order_items_offer_xor_store_offer_chk'
    ) THEN
      ALTER TABLE public.order_items
        ADD CONSTRAINT order_items_offer_xor_store_offer_chk
        CHECK ( (offer_id IS NULL) <> (store_offer_id IS NULL) );
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
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_schema='public' AND table_name='order_items' AND constraint_name='order_items_offer_xor_store_offer_chk'
    ) THEN
      ALTER TABLE public.order_items DROP CONSTRAINT order_items_offer_xor_store_offer_chk;
    END IF;
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_schema='public' AND table_name='order_items' AND constraint_name='order_items_store_offer_id_fkey'
    ) THEN
      ALTER TABLE public.order_items DROP CONSTRAINT order_items_store_offer_id_fkey;
    END IF;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='order_items' AND column_name='store_offer_id'
    ) THEN
      ALTER TABLE public.order_items DROP COLUMN store_offer_id;
    END IF;
    -- Optionally restore NOT NULL
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='order_items' AND column_name='offer_id' AND is_nullable='YES'
    ) THEN
      ALTER TABLE public.order_items ALTER COLUMN offer_id SET NOT NULL;
    END IF;
  END
  $$;`);
};


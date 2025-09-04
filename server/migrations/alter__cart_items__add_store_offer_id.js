// type: module
/** @type {import('umzug').MigrationFn<{ context: import('sequelize').QueryInterface }>} */
export const up = async ({ context: q }) => {
  await q.sequelize.query(`
  DO $$
  DECLARE has_cart_items boolean;
  DECLARE has_store_offers boolean;
  BEGIN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema='public' AND table_name='cart_items'
    ) INTO has_cart_items;

    IF NOT has_cart_items THEN
      RAISE NOTICE 'cart_items missing; skipping alter__cart_items__add_store_offer_id.';
      RETURN;
    END IF;

    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema='public' AND table_name='store_offers'
    ) INTO has_store_offers;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='cart_items'
        AND column_name='offer_id' AND is_nullable='NO'
    ) THEN
      ALTER TABLE public.cart_items ALTER COLUMN offer_id DROP NOT NULL;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='cart_items'
        AND column_name='store_offer_id'
    ) THEN
      ALTER TABLE public.cart_items ADD COLUMN store_offer_id BIGINT;
    END IF;

    IF has_store_offers AND NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_schema='public' AND table_name='cart_items'
        AND constraint_name='cart_items_store_offer_id_fkey'
    ) THEN
      ALTER TABLE public.cart_items
        ADD CONSTRAINT cart_items_store_offer_id_fkey
        FOREIGN KEY (store_offer_id) REFERENCES public.store_offers(id)
        ON UPDATE CASCADE ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_class WHERE relname = 'cart_items_cart_id_store_offer_id_unique'
    ) THEN
      CREATE UNIQUE INDEX cart_items_cart_id_store_offer_id_unique
      ON public.cart_items (cart_id, store_offer_id)
      WHERE store_offer_id IS NOT NULL;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_schema='public' AND table_name='cart_items'
        AND constraint_name='cart_items_offer_xor_store_offer_chk'
    ) THEN
      ALTER TABLE public.cart_items
        ADD CONSTRAINT cart_items_offer_xor_store_offer_chk
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
      WHERE table_schema='public' AND table_name='cart_items'
        AND constraint_name='cart_items_offer_xor_store_offer_chk'
    ) THEN
      ALTER TABLE public.cart_items DROP CONSTRAINT cart_items_offer_xor_store_offer_chk;
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_schema='public' AND table_name='cart_items'
        AND constraint_name='cart_items_cart_id_store_offer_id_unique'
    ) THEN
      ALTER TABLE public.cart_items DROP CONSTRAINT cart_items_cart_id_store_offer_id_unique;
    ELSIF EXISTS (
      SELECT 1 FROM pg_class WHERE relname = 'cart_items_cart_id_store_offer_id_unique'
    ) THEN
      DROP INDEX public.cart_items_cart_id_store_offer_id_unique;
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_schema='public' AND table_name='cart_items'
        AND constraint_name='cart_items_store_offer_id_fkey'
    ) THEN
      ALTER TABLE public.cart_items DROP CONSTRAINT cart_items_store_offer_id_fkey;
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='cart_items'
        AND column_name='store_offer_id'
    ) THEN
      ALTER TABLE public.cart_items DROP COLUMN store_offer_id;
    END IF;
  END
  $$;`);
};

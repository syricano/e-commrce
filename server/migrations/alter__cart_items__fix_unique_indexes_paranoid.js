// type: module
/** @type {import('umzug').MigrationFn<{ context: import('sequelize').QueryInterface }>} */
export const up = async ({ context: q }) => {
  await q.sequelize.query(`
  DO $$
  DECLARE has_cart_items boolean;
  BEGIN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema='public' AND table_name='cart_items'
    ) INTO has_cart_items;

    IF NOT has_cart_items THEN
      RAISE NOTICE 'cart_items missing; skipping alter__cart_items__fix_unique_indexes_paranoid.';
      RETURN;
    END IF;

    -- Drop known previous unique index on (cart_id, store_offer_id)
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cart_items_cart_id_store_offer_id_unique') THEN
      DROP INDEX public.cart_items_cart_id_store_offer_id_unique;
    END IF;

    -- Drop any non-paranoid unique indexes on (cart_id, store_offer_id)
    FOR DECLARE idxname text IN
      SELECT indexname FROM pg_indexes
      WHERE schemaname='public' AND tablename='cart_items'
        AND indexdef ILIKE '%UNIQUE INDEX%'
        AND indexdef ILIKE '%(cart_id, store_offer_id)%'
        AND indexdef NOT ILIKE '%deleted_at%'
    LOOP
      EXECUTE format('DROP INDEX IF EXISTS public.%I;', idxname);
    END LOOP;

    -- Drop any non-paranoid unique indexes on (cart_id, offer_id)
    FOR DECLARE idxname2 text IN
      SELECT indexname FROM pg_indexes
      WHERE schemaname='public' AND tablename='cart_items'
        AND indexdef ILIKE '%UNIQUE INDEX%'
        AND indexdef ILIKE '%(cart_id, offer_id)%'
        AND indexdef NOT ILIKE '%deleted_at%'
    LOOP
      EXECUTE format('DROP INDEX IF EXISTS public.%I;', idxname2);
    END LOOP;

    -- Create paranoid-aware unique indexes (active rows only)
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cart_items_cart_id_store_offer_id_active_unique') THEN
      CREATE UNIQUE INDEX cart_items_cart_id_store_offer_id_active_unique
      ON public.cart_items (cart_id, store_offer_id)
      WHERE store_offer_id IS NOT NULL AND deleted_at IS NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cart_items_cart_id_offer_id_active_unique') THEN
      CREATE UNIQUE INDEX cart_items_cart_id_offer_id_active_unique
      ON public.cart_items (cart_id, offer_id)
      WHERE offer_id IS NOT NULL AND deleted_at IS NULL;
    END IF;
  END
  $$;`);
};

/** @type {import('umzug').MigrationFn<{ context: import('sequelize').QueryInterface }>} */
export const down = async ({ context: q }) => {
  await q.sequelize.query(`
  DO $$
  BEGIN
    -- Drop paranoid-aware indexes
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cart_items_cart_id_store_offer_id_active_unique') THEN
      DROP INDEX public.cart_items_cart_id_store_offer_id_active_unique;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cart_items_cart_id_offer_id_active_unique') THEN
      DROP INDEX public.cart_items_cart_id_offer_id_active_unique;
    END IF;

    -- Recreate the previous non-paranoid index on (cart_id, store_offer_id) if desired
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cart_items_cart_id_store_offer_id_unique') THEN
      CREATE UNIQUE INDEX cart_items_cart_id_store_offer_id_unique
      ON public.cart_items (cart_id, store_offer_id)
      WHERE store_offer_id IS NOT NULL;
    END IF;
  END
  $$;`);
};


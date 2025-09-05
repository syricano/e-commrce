// Allow exactly one of offer_id, store_offer_id, listing_id on order_items
// type: module
/** @type {import('umzug').MigrationFn<{ context: import('sequelize').QueryInterface }>} */
export const up = async ({ context: q }) => {
  await q.sequelize.query(`
  DO $$
  DECLARE has_order_items boolean;
  DECLARE has_listing_id boolean;
  BEGIN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema='public' AND table_name='order_items'
    ) INTO has_order_items;

    IF NOT has_order_items THEN
      RAISE NOTICE 'order_items missing; skipping alter__order_items__xor_three_cols.';
      RETURN;
    END IF;

    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='order_items' AND column_name='listing_id'
    ) INTO has_listing_id;

    -- Drop old 2-col XOR if present
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_schema='public' AND table_name='order_items'
        AND constraint_name='order_items_offer_xor_store_offer_chk'
    ) THEN
      ALTER TABLE public.order_items DROP CONSTRAINT order_items_offer_xor_store_offer_chk;
    END IF;

    -- Add 3-col XOR
    IF has_listing_id AND NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_schema='public' AND table_name='order_items'
        AND constraint_name='order_items_exactly_one_ref_chk'
    ) THEN
      ALTER TABLE public.order_items
        ADD CONSTRAINT order_items_exactly_one_ref_chk
        CHECK (
          ((CASE WHEN offer_id IS NOT NULL THEN 1 ELSE 0 END) +
           (CASE WHEN store_offer_id IS NOT NULL THEN 1 ELSE 0 END) +
           (CASE WHEN listing_id IS NOT NULL THEN 1 ELSE 0 END)) = 1
        );
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
      WHERE table_schema='public' AND table_name='order_items'
        AND constraint_name='order_items_exactly_one_ref_chk'
    ) THEN
      ALTER TABLE public.order_items DROP CONSTRAINT order_items_exactly_one_ref_chk;
    END IF;
  END
  $$;`);
};


// type: module
/** @type {import('umzug').MigrationFn<{ context: import('sequelize').QueryInterface }>} */
export const up = async ({ context: q }) => {
  await q.sequelize.query(`
  DO $$
  DECLARE has_cart_items boolean;
  DECLARE has_listing_id boolean;
  BEGIN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema='public' AND table_name='cart_items'
    ) INTO has_cart_items;

    IF NOT has_cart_items THEN
      RAISE NOTICE 'cart_items missing; skipping alter__cart_items__xor_three_cols.';
      RETURN;
    END IF;

    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='cart_items' AND column_name='listing_id'
    ) INTO has_listing_id;

    -- Drop old 2-col XOR constraint if present
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_schema='public' AND table_name='cart_items'
        AND constraint_name='cart_items_offer_xor_store_offer_chk'
    ) THEN
      ALTER TABLE public.cart_items DROP CONSTRAINT cart_items_offer_xor_store_offer_chk;
    END IF;

    -- Add 3-col XOR: exactly one of offer_id, store_offer_id, listing_id is NOT NULL
    IF has_listing_id AND NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_schema='public' AND table_name='cart_items'
        AND constraint_name='cart_items_exactly_one_ref_chk'
    ) THEN
      ALTER TABLE public.cart_items
        ADD CONSTRAINT cart_items_exactly_one_ref_chk
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
      WHERE table_schema='public' AND table_name='cart_items'
        AND constraint_name='cart_items_exactly_one_ref_chk'
    ) THEN
      ALTER TABLE public.cart_items DROP CONSTRAINT cart_items_exactly_one_ref_chk;
    END IF;
  END
  $$;`);
};


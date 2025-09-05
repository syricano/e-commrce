// Normalize amounts to major units (no cents) for core tables
// Note: This migration divides certain columns by 100 to convert from minor → major.
// It intentionally skips Listings (already stored as major) and C2C offer/transaction amounts.
// type: module
/** @type {import('umzug').MigrationFn<{ context: import('sequelize').QueryInterface }>} */
export const up = async ({ context: q }) => {
  // Helper to safely divide integer columns by 100
  const divBy100 = async (table, cols = []) => {
    for (const c of cols) {
      await q.sequelize.query(`
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema='public' AND table_name='${table}' AND column_name='${c}'
          ) THEN
            UPDATE public.${table} SET ${c} = FLOOR(COALESCE(${c}, 0) / 100.0);
          END IF;
        END$$;`);
    }
  };

  // Merchant offers
  await divBy100('store_offers', ['price_amount', 'compare_at_amount']);

  // B2C offers
  await divBy100('offers', ['price_amount', 'compare_at_amount']);

  // Cart
  await divBy100('cart_items', ['unit_price_amount']);
  await divBy100('carts', ['items_subtotal_amount', 'shipping_amount', 'tax_amount', 'discount_amount', 'grand_total_amount']);

  // Orders
  await divBy100('order_items', ['unit_price_amount']);
  await divBy100('orders', ['items_subtotal_amount', 'shipping_amount', 'tax_amount', 'discount_amount', 'grand_total_amount']);

  // Payments / Refunds / Payouts
  await divBy100('payments', ['amount']);
  await divBy100('refunds', ['amount']);
  await divBy100('payouts', ['amount']);
};

/** @type {import('umzug').MigrationFn<{ context: import('sequelize').QueryInterface }>} */
export const down = async () => {
  // Irreversible without original precision; leave as no-op.
};


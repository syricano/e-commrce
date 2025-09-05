// type: module
/** @type {import('umzug').MigrationFn<{ context: import('sequelize').QueryInterface }>} */
export const up = async ({ context: q }) => {
  const [rows] = await q.sequelize.query(
    `SELECT indexname, indexdef FROM pg_indexes WHERE schemaname='public' AND tablename='cart_items'`
  );
  const names = new Set(rows.map((r) => r.indexname));
  const ok1 = names.has('cart_items_cart_id_store_offer_id_active_unique');
  const ok2 = names.has('cart_items_cart_id_offer_id_active_unique');
  // eslint-disable-next-line no-console
  console.log('HEALTH: cart_items unique(partial, active rows) indexes:', {
    storeOfferIndex: ok1 ? 'OK' : 'MISSING',
    offerIndex: ok2 ? 'OK' : 'MISSING',
  });
};

/** @type {import('umzug').MigrationFn<{ context: import('sequelize').QueryInterface }>} */
export const down = async () => {
  // no-op health migration
};


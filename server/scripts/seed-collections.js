// server/scripts/seed-collections.js
// Seeds two collections:
// - featured (manual): picks latest active store offers
// - new-arrivals (rule): rule-based, shows active store offers sorted by createdAt
import sequelize from '../db/index.js';
import applyAssociations from '../db/association.js';
import Collection from '../models/Collection.js';
import CollectionTranslation from '../models/CollectionTranslation.js';
import CollectionItem from '../models/CollectionItem.js';
import CollectionRule from '../models/CollectionRule.js';
import StoreOffer from '../models/StoreOffer.js';
import StoreProduct from '../models/StoreProduct.js';

async function upsertTranslation(t, collectionId, locale, title, slug, subtitle = null) {
  const row = await CollectionTranslation.findOne({ where: { collectionId, locale }, paranoid: false, transaction: t });
  if (row) return row.update({ title, slug, subtitle }, { transaction: t });
  return CollectionTranslation.create({ collectionId, locale, title, slug, subtitle }, { transaction: t });
}

async function ensureFeatured(t) {
  let coll = await Collection.findOne({ where: { key: 'featured' }, paranoid: false, transaction: t });
  if (!coll) coll = await Collection.create({ key: 'featured', type: 'manual', isActive: true, metadata: {} }, { transaction: t });
  else { if (coll.deletedAt) await coll.restore({ transaction: t }); await coll.update({ type: 'manual', isActive: true }, { transaction: t }); }
  await upsertTranslation(t, coll.id, 'ar', 'مختارات المحرر', 'featured', 'عناصر مختارة يدويًا');
  await upsertTranslation(t, coll.id, 'en', 'Editor’s Picks', 'featured', 'Hand-picked items');

  const offers = await StoreOffer.findAll({
    where: { isActive: true },
    include: [{ model: StoreProduct, as: 'product', required: true }],
    order: [['createdAt', 'DESC'], ['id', 'DESC']],
    limit: 8,
    transaction: t,
  });
  await CollectionItem.destroy({ where: { collectionId: coll.id }, force: true, transaction: t });
  let rank = 0;
  for (const o of offers) {
    await CollectionItem.create({ collectionId: coll.id, kind: 'storeOffer', refId: o.id, rank, pinned: rank < 2, isActive: true }, { transaction: t });
    rank += 1;
  }
  console.log(`✔ Seeded 'featured' with ${offers.length} store offers.`);
}

async function ensureNewArrivals(t) {
  let coll = await Collection.findOne({ where: { key: 'new-arrivals' }, paranoid: false, transaction: t });
  if (!coll) coll = await Collection.create({ key: 'new-arrivals', type: 'rule', isActive: true, metadata: {} }, { transaction: t });
  else { if (coll.deletedAt) await coll.restore({ transaction: t }); await coll.update({ type: 'rule', isActive: true }, { transaction: t }); }
  await upsertTranslation(t, coll.id, 'ar', 'وصل حديثًا من المتاجر', 'new-arrivals', 'أحدث العروض من المتاجر');
  await upsertTranslation(t, coll.id, 'en', 'New from Stores', 'new-arrivals', 'Latest store offers');

  let rule = await CollectionRule.findOne({ where: { collectionId: coll.id }, paranoid: false, transaction: t });
  const query = { target: 'storeOffer', and: [{ field: 'isActive', op: '=', value: true }], sort: 'createdAt' };
  if (!rule) rule = await CollectionRule.create({ collectionId: coll.id, query }, { transaction: t });
  else await rule.update({ query }, { transaction: t });
  console.log(`✔ Seeded 'new-arrivals' as rule collection.`);
}

async function main() {
  applyAssociations();
  await sequelize.authenticate();
  await sequelize.transaction(async (t) => {
    await ensureFeatured(t);
    await ensureNewArrivals(t);
  });
  await sequelize.close();
}

main().catch((e) => { console.error(e); process.exit(1); });


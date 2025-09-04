// server/scripts/seedCollections.js
import sequelize from '../db/index.js';
import Collection from '../models/Collection.js';
import CollectionRule from '../models/CollectionRule.js';
import CollectionTranslation from '../models/CollectionTranslation.js';

const KEY = 'new-arrivals';

async function upsertTranslation(t, collectionId, locale, title, slug, subtitle = null) {
  const existing = await CollectionTranslation.findOne({ where: { collectionId, locale }, transaction: t, paranoid: false });
  if (existing) {
    await existing.update({ title, slug, subtitle }, { transaction: t });
    return existing;
  }
  return CollectionTranslation.create({ collectionId, locale, title, slug, subtitle }, { transaction: t });
}

async function main() {
  await sequelize.authenticate();

  await sequelize.transaction(async (t) => {
    // Ensure collection exists
    let coll = await Collection.findOne({ where: { key: KEY }, transaction: t, paranoid: false });
    if (!coll) {
      coll = await Collection.create(
        { key: KEY, type: 'rule', isActive: true, metadata: { sort: 'createdAt' } },
        { transaction: t }
      );
    } else {
      if (coll.deletedAt) await coll.restore({ transaction: t });
      await coll.update({ type: 'rule', isActive: true }, { transaction: t });
    }

    // Upsert translations (Arabic first, then English)
    await upsertTranslation(t, coll.id, 'ar', 'وصل حديثًا من المتاجر', 'new-arrivals', 'أحدث العروض من المتاجر');
    await upsertTranslation(t, coll.id, 'en', 'New from Stores', 'new-arrivals', 'Latest store offers');

    // Upsert rule: active offers created in last 30 days
    const ruleBody = {
      and: [
        { field: 'isActive', op: '=', value: true },
        { field: 'createdAt', op: '>=', value: 'now()-30d' },
      ],
      sort: 'createdAt',
    };

    const rule = await CollectionRule.findOne({ where: { collectionId: coll.id }, transaction: t, paranoid: false });
    if (rule) {
      if (rule.deletedAt) await rule.restore({ transaction: t });
      await rule.update({ query: ruleBody }, { transaction: t });
    } else {
      await CollectionRule.create({ collectionId: coll.id, query: ruleBody }, { transaction: t });
    }

    console.log(`Seeded collection '${KEY}' (id=${coll.id}) with AR/EN translations and rule.`);
  });

  await sequelize.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

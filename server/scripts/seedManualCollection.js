// server/scripts/seedManualCollection.js
import sequelize from '../db/index.js';

import { Op } from 'sequelize';
import applyAssociations from '../db/association.js';

import Collection from '../models/Collection.js';
import CollectionTranslation from '../models/CollectionTranslation.js';
import CollectionItem from '../models/CollectionItem.js';

import StoreOffer from '../models/StoreOffer.js';
import StoreProduct from '../models/StoreProduct.js';

const KEY = 'featured';
const TITLE_AR = 'مختارات المحرر';
const TITLE_EN = 'Editor’s Picks';

async function upsertTranslation(t, collectionId, locale, title, slug, subtitle = null) {
  const existing = await CollectionTranslation.findOne({ where: { collectionId, locale }, transaction: t, paranoid: false });
  if (existing) return existing.update({ title, slug, subtitle }, { transaction: t });
  return CollectionTranslation.create({ collectionId, locale, title, slug, subtitle }, { transaction: t });
}

async function main() {
  // Ensure associations are registered so includes like { as: 'product' } work
  applyAssociations();

  await sequelize.authenticate();

  await sequelize.transaction(async (t) => {
    // 1) Ensure manual collection
    let coll = await Collection.findOne({ where: { key: KEY }, transaction: t, paranoid: false });
    if (!coll) {
      coll = await Collection.create({ key: KEY, type: 'manual', isActive: true, metadata: {} }, { transaction: t });
    } else {
      if (coll.deletedAt) await coll.restore({ transaction: t });
      await coll.update({ type: 'manual', isActive: true }, { transaction: t });
    }

    // 2) Translations
    await upsertTranslation(t, coll.id, 'ar', TITLE_AR, KEY, 'عناصر مختارة يدويًا');
    await upsertTranslation(t, coll.id, 'en', TITLE_EN, KEY, 'Hand-picked items');

    // 3) Pick latest 8 active offers as examples
    const offers = await StoreOffer.findAll({
      where: { isActive: true },
      include: [{ model: StoreProduct, as: 'product', required: true }],
      order: [['createdAt', 'DESC'], ['id', 'DESC']],
      limit: 8,
      transaction: t,
    });

    // 4) Clear old picks then insert in order
    await CollectionItem.destroy({ where: { collectionId: coll.id }, force: true, transaction: t });
    let rank = 0;
    for (const o of offers) {
      await CollectionItem.create(
        {
          collectionId: coll.id,
          kind: 'storeOffer',
          refId: o.id,
          rank: rank++,
          pinned: rank <= 2,
          isActive: true,
        },
        { transaction: t }
      );
    }

    console.log(`Seeded manual collection '${KEY}' with ${offers.length} picks (id=${coll.id}).`);
  });

  await sequelize.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

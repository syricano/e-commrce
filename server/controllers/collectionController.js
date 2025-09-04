// server/controllers/collectionController.js
import asyncHandler from '../utils/asyncHandler.js';
import Collection from '../models/Collection.js';
import CollectionTranslation from '../models/CollectionTranslation.js';
import { getById, createOne, updateById, deleteById } from './crudFactory.js';

/* List collections with optional filters and translations */
export const listCollections = asyncHandler(async (req, res) => {
  const { page = '1', limit = '50', key, type, isActive, locale } = req.query;
  const p = Math.max(parseInt(page, 10) || 1, 1);
  const l = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);

  const where = {};
  if (key) where.key = String(key);
  if (type) where.type = String(type);
  if (isActive != null) where.isActive = String(isActive) !== 'false';

  const include = [{
    model: CollectionTranslation,
    as: 'translations',
    required: false,
    attributes: ['id', 'locale', 'title', 'slug', 'subtitle'],
    ...(locale ? { where: { locale: String(locale) } } : {}),
  }];

  const { count, rows } = await Collection.findAndCountAll({
    where,
    include,
    order: [['id', 'DESC']],
    limit: l,
    offset: (p - 1) * l,
  });

  res.json({ total: count, items: rows, page: p, limit: l });
});

/* Get one collection with translations */
export const getCollection = getById(Collection, [
  {
    model: CollectionTranslation,
    as: 'translations',
    required: false,
    attributes: ['id', 'locale', 'title', 'slug', 'subtitle'],
  },
]);

export const createCollection = createOne(Collection);
export const updateCollection = updateById(Collection);
export const deleteCollection = deleteById(Collection);

export default { listCollections, getCollection, createCollection, updateCollection, deleteCollection };

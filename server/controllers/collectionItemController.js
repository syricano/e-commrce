import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import CollectionItem from '../models/CollectionItem.js';

/* List with filters: collectionId, kind, isActive */
export const listCollectionItems = asyncHandler(async (req, res) => {
  const { page = '1', limit = '50', collectionId, kind, isActive } = req.query;
  const p = Math.max(parseInt(page, 10) || 1, 1);
  const l = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);

  const where = {};
  if (collectionId) where.collectionId = Number(collectionId);
  if (kind) where.kind = String(kind);
  if (isActive != null) where.isActive = String(isActive) !== 'false';

  const { count, rows } = await CollectionItem.findAndCountAll({
    where,
    order: [['pinned', 'DESC'], ['rank', 'ASC'], ['id', 'ASC']],
    limit: l,
    offset: (p - 1) * l,
  });

  res.json({ total: count, items: rows, page: p, limit: l });
});

/* Get by id */
export const getCollectionItem = asyncHandler(async (req, res) => {
  const row = await CollectionItem.findByPk(req.params.id);
  if (!row) throw new ErrorResponse('Not found', 404);
  res.json(row);
});

/* Create manual pick */
export const createCollectionItem = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const allowedKinds = ['storeOffer', 'product', 'listing'];

  const payload = {
    collectionId: Number(body.collectionId),
    kind: String(body.kind || 'storeOffer'),
    refId: Number(body.refId),
    rank: Number.isFinite(Number(body.rank)) ? Number(body.rank) : 0,
    pinned: body.pinned !== false && Boolean(body.pinned),
    isActive: body.isActive !== false,
    metadata: body.metadata || null,
  };

  if (!payload.collectionId || !payload.refId) {
    return res.status(400).json({ error: 'collectionId and refId are required' });
  }
  if (!allowedKinds.includes(payload.kind)) {
    return res.status(400).json({ error: `kind must be one of ${allowedKinds.join(', ')}` });
  }

  try {
    const row = await CollectionItem.create(payload);
    return res.status(201).json(row);
  } catch (e) {
    if (e?.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Item already exists for this collection' });
    }
    return res.status(500).json({ error: 'Failed to create collection item' });
  }
});

/* Update manual pick */
export const updateCollectionItem = asyncHandler(async (req, res) => {
  const row = await CollectionItem.findByPk(req.params.id);
  if (!row) throw new ErrorResponse('Not found', 404);

  const allowed = ['kind', 'refId', 'rank', 'pinned', 'isActive', 'metadata'];
  const patch = {};
  for (const k of allowed) {
    if (Object.prototype.hasOwnProperty.call(req.body || {}, k)) patch[k] = req.body[k];
  }

  if (patch.kind) {
    const allowedKinds = ['storeOffer', 'product', 'listing'];
    if (!allowedKinds.includes(String(patch.kind))) {
      return res.status(400).json({ error: `kind must be one of ${allowedKinds.join(', ')}` });
    }
  }
  if (patch.refId != null) patch.refId = Number(patch.refId);

  await row.update(patch);
  res.json(row);
});

/* Delete manual pick */
export const deleteCollectionItem = asyncHandler(async (req, res) => {
  const row = await CollectionItem.findByPk(req.params.id);
  if (!row) throw new ErrorResponse('Not found', 404);
  await row.destroy();
  res.status(204).end();
});

export default {
  listCollectionItems,
  getCollectionItem,
  createCollectionItem,
  updateCollectionItem,
  deleteCollectionItem,
};

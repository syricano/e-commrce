// server/routes/collectionPublicRouter.js
import express from 'express';
import { Op } from 'sequelize';
import asyncHandler from '../utils/asyncHandler.js';

import Collection from '../models/Collection.js';
import CollectionItem from '../models/CollectionItem.js';

import StoreOffer from '../models/StoreOffer.js';
import StoreProduct from '../models/StoreProduct.js';
import Store from '../models/Store.js';
import StoreProductMedia from '../models/StoreProductMedia.js';

const collectionPublicRouter = express.Router();
const toMajor = (v) => (Number.isFinite(Number(v)) ? Number(v) / 100 : 0);

// GET /api/collections/:key/items
collectionPublicRouter.get(
  '/:key/items',
  asyncHandler(async (req, res) => {
    const { key } = req.params;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 24, 1), 100);

    // find collection by key or numeric id
    const coll = await Collection.findOne({
      where: {
        [Op.or]: [
          { key: String(key) },
          Number.isFinite(Number(key)) ? { id: Number(key) } : null,
        ].filter(Boolean),
      },
    });
    if (!coll) return res.status(404).json({ error: 'Collection not found' });

    // manual items
    const items = await CollectionItem.findAll({
      where: { collectionId: coll.id, isActive: true },
      order: [['pinned', 'DESC'], ['rank', 'ASC'], ['id', 'ASC']],
      limit,
    });

    // fetch referenced store offers
    const soIds = items
      .filter((it) => it.kind === 'storeOffer')
      .map((it) => Number(it.refId))
      .filter((n) => Number.isFinite(n));

    const offers = soIds.length
      ? await StoreOffer.findAll({
          where: { id: { [Op.in]: soIds }, isActive: true },
          include: [
            {
              model: StoreProduct,
              as: 'product',
              required: true,
              attributes: ['id', 'name', 'articleNumber', 'storeId', 'categoryId'],
              include: [
                { model: Store, as: 'store', attributes: ['id', 'name', 'slug'] },
                { model: StoreProductMedia, as: 'media', attributes: ['id', 'url', 'position', 'altText'] },
              ],
            },
          ],
        })
      : [];

    const byId = new Map(offers.map((o) => [Number(o.id), o]));

    // shape response with MAJOR-unit prices and stable storeOfferId
    const out = items
      .map((it) => {
        if (it.kind !== 'storeOffer') return null;
        const o = byId.get(Number(it.refId));
        if (!o) return null;

        const p = o.product || {};
        const img = Array.isArray(p.media) && p.media[0] ? p.media[0].url : null;

        return {
          id: Number(it.id),
          kind: 'storeOffer',
          refId: Number(it.refId),
          storeOfferId: Number(o.id),

          pinned: Boolean(it.pinned),
          rank: Number(it.rank) || 0,

          title: p.name || `#${p.id}`,
          sku: p.articleNumber || null,
          image: img,

          priceAmount: toMajor(o.priceAmount),
          compareAtAmount: o.compareAtAmount == null ? null : toMajor(o.compareAtAmount),
          currency: o.currency || 'EUR',
          stockOnHand: Number.isFinite(Number(o.stockOnHand)) ? Number(o.stockOnHand) : null,

          store: p.store ? { id: p.store.id, name: p.store.name, slug: p.store.slug } : null,
          href: `/offers/store/${o.id}`,

          updatedAt: o.updatedAt,
          createdAt: o.createdAt,
        };
      })
      .filter(Boolean);

    res.json({
      id: Number(coll.id),
      key: coll.key,
      type: coll.type,
      total: out.length,
      items: out,
    });
  })
);

export default collectionPublicRouter;

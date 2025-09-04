// server/controllers/collectionPublicController.js
import { Op } from 'sequelize';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';

import Collection from '../models/Collection.js';
import CollectionRule from '../models/CollectionRule.js';
import CollectionItem from '../models/CollectionItem.js';
import CollectionTranslation from '../models/CollectionTranslation.js';

// Merchant offers stack
import StoreOffer from '../models/StoreOffer.js';
import StoreProduct from '../models/StoreProduct.js';
import StoreProductMedia from '../models/StoreProductMedia.js';
import Store from '../models/Store.js';

// Catalog products stack
import Product from '../models/Product.js';
import ProductTranslation from '../models/ProductTranslation.js';
import Media from '../models/Media.js';

/* ------------------------------ helpers ------------------------------ */

const parseNowMinusDays = (v) => {
  if (typeof v === 'string') {
    const m = v.match(/^now\(\)-(\d+)d$/i);
    if (m) {
      const days = parseInt(m[1], 10) || 0;
      return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    }
  }
  return v;
};

const cmpByManualOrder = (ids) => {
  const idx = new Map(ids.map((id, i) => [Number(id), i]));
  return (a, b) => (idx.get(Number(a.id)) ?? 0) - (idx.get(Number(b.id)) ?? 0);
};

const pickCollectionTr = async (collectionId, locale) => {
  const tryOne = async (loc) =>
    CollectionTranslation.findOne({ where: { collectionId, locale: loc } });
  return (
    (await tryOne(locale)) ||
    (await tryOne('ar')) ||
    (await tryOne('en')) ||
    (await CollectionTranslation.findOne({ where: { collectionId } }))
  );
};

const pickTr = (translations = [], locale = 'ar') => {
  const byLocale = new Map();
  for (const tr of translations) byLocale.set(tr.locale, tr);
  return byLocale.get(locale) || byLocale.get('ar') || byLocale.get('en') || translations[0] || null;
};

/**
 * Compile a rule JSON for target = storeOffer into Sequelize where/order.
 * Allowed fields on StoreOffer: isActive, priceAmount, currency, createdAt
 * Allowed via StoreProduct include: storeId, categoryId
 */
function compileStoreOfferRule(rule = {}) {
  const where = {};
  const includeProduct = {
    model: StoreProduct,
    as: 'product',
    required: true,
    attributes: ['id', 'name', 'articleNumber', 'storeId', 'categoryId'],
  };

  const clauses = Array.isArray(rule.and) ? rule.and : [];
  for (const c of clauses) {
    const field = String(c?.field || '').trim();
    const op = String(c?.op || '=').trim();
    let val = c?.value;

    val = parseNowMinusDays(val);
    if (field === 'isActive' && typeof val === 'string') {
      const s = val.toLowerCase();
      if (s === 'true' || s === '1') val = true;
      if (s === 'false' || s === '0') val = false;
    }

    const setOp = (obj, key, operator, value) => {
      if (operator === '=' || operator === 'eq') obj[key] = value;
      else if (operator === '>') obj[key] = { [Op.gt]: value };
      else if (operator === '>=') obj[key] = { [Op.gte]: value };
      else if (operator === '<') obj[key] = { [Op.lt]: value };
      else if (operator === '<=') obj[key] = { [Op.lte]: value };
      else if (operator === 'in' && Array.isArray(value)) obj[key] = { [Op.in]: value };
    };

    if (['isActive', 'priceAmount', 'currency', 'createdAt'].includes(field)) {
      setOp(where, field, op, val);
    } else if (field === 'storeId') {
      includeProduct.where = { ...(includeProduct.where || {}), storeId: Number(val) };
    } else if (field === 'categoryId') {
      includeProduct.where = { ...(includeProduct.where || {}), categoryId: Number(val) };
    }
  }

  if (where.isActive == null) where.isActive = true;

  let order = [['id', 'DESC']];
  const sort = String(rule.sort || '').trim();
  if (sort === 'createdAt') order = [['createdAt', 'DESC']];
  if (sort === 'priceAsc') order = [['priceAmount', 'ASC']];
  if (sort === 'priceDesc') order = [['priceAmount', 'DESC']];

  return { where, includeProduct, order };
}

/* ------------------------------ resolver ------------------------------ */

/**
 * GET /api/collections/:key/items?locale=ar&limit=24&page=1
 * Arabic is the default locale. Falls back to ar → en → any.
 */
export const listItemsByKey = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const locale = String(req.query.locale || 'ar');
  const { page = '1', limit = '24' } = req.query;
  const p = Math.max(parseInt(page, 10) || 1, 1);
  const l = Math.min(Math.max(parseInt(limit, 10) || 24, 1), 100);

  const coll = await Collection.findOne({ where: { key, isActive: true } });
  if (!coll) throw new ErrorResponse('Collection not found', 404);

  const tr = await pickCollectionTr(coll.id, locale);
  const collDto = {
    id: coll.id,
    key: coll.key,
    type: coll.type,
    isActive: coll.isActive,
    translation: tr
      ? { locale: tr.locale, title: tr.title, slug: tr.slug, subtitle: tr.subtitle }
      : null,
  };

  if (coll.type === 'manual') {
    const { rows } = await CollectionItem.findAndCountAll({
      where: { collectionId: coll.id, isActive: true },
      order: [['pinned', 'DESC'], ['rank', 'ASC'], ['id', 'ASC']],
      limit: l,
      offset: (p - 1) * l,
    });

    const byKind = rows.reduce((acc, r) => {
      const k = r.kind;
      if (!acc[k]) acc[k] = [];
      acc[k].push(r.refId);
      return acc;
    }, {});

    const out = [];

    // storeOffer picks
    if (Array.isArray(byKind.storeOffer) && byKind.storeOffer.length) {
      const ids = byKind.storeOffer.map(Number);
      const offers = await StoreOffer.findAll({
        where: { id: { [Op.in]: ids }, isActive: true },
        include: [
          {
            model: StoreProduct,
            as: 'product',
            required: true,
            attributes: ['id', 'name', 'articleNumber', 'storeId', 'categoryId'],
            include: [
              { model: StoreProductMedia, as: 'media', required: false, attributes: ['id', 'url', 'position'] },
              { model: Store, as: 'store', required: true, attributes: ['id', 'name', 'slug'] },
            ],
          },
        ],
      });
      offers.sort(cmpByManualOrder(ids));
      for (const o of offers) {
        const img = o?.product?.media?.[0]?.url || null;
        out.push({
          type: 'storeOffer',
          id: o.id,
          title: o?.product?.name || `#${o.id}`,
          imageUrl: img,
          priceAmount: o.priceAmount ?? null,
          currency: o.currency || 'EUR',
          href: `/offers/${o.id}`,
          store: o?.product?.store ? { id: o.product.store.id, name: o.product.store.name, slug: o.product.store.slug } : null,
        });
      }
    }

    // product picks
    if (Array.isArray(byKind.product) && byKind.product.length) {
      const ids = byKind.product.map(Number);
      const products = await Product.findAll({
        where: {
          id: { [Op.in]: ids },
          isActive: true,
          moderationStatus: 'approved',
        },
        include: [
          { model: ProductTranslation, as: 'translations', required: false, attributes: ['locale', 'name', 'slug'] },
          { model: Media, as: 'media', required: false, attributes: ['id', 'url', 'position'] },
        ],
      });
      products.sort(cmpByManualOrder(ids));
      for (const p of products) {
        const trBest = pickTr(p?.translations || [], locale);
        const img = p?.media?.[0]?.url || null;
        out.push({
          type: 'product',
          id: p.id,
          title: trBest?.name || `#${p.id}`,
          imageUrl: img,
          priceAmount: null,
          currency: 'EUR',
          href: trBest?.slug ? `/p/${trBest.slug}` : `/products/${p.id}`,
          store: null,
        });
      }
    }

    return res.json({ collection: collDto, total: out.length, items: out, page: p, limit: l, locale });
  }

  if (coll.type === 'rule') {
    const rule = await CollectionRule.findOne({ where: { collectionId: coll.id } });
    const query = rule?.query || {};
    const { where, includeProduct, order } = compileStoreOfferRule(query);

    const { count, rows } = await StoreOffer.findAndCountAll({
      where,
      include: [
        {
          ...includeProduct,
          include: [
            { model: StoreProductMedia, as: 'media', required: false, attributes: ['id', 'url', 'position'] },
            { model: Store, as: 'store', required: true, attributes: ['id', 'name', 'slug'] },
          ],
        },
      ],
      order,
      limit: l,
      offset: (p - 1) * l,
    });

    const items = rows.map((o) => {
      const img = o?.product?.media?.[0]?.url || null;
      return {
        type: 'storeOffer',
        id: o.id,
        title: o?.product?.name || `#${o.id}`,
        imageUrl: img,
        priceAmount: o.priceAmount ?? null,
        currency: o.currency || 'EUR',
        href: `/offers/${o.id}`,
        store: o?.product?.store ? { id: o.product.store.id, name: o.product.store.name, slug: o.product.store.slug } : null,
      };
    });

    return res.json({ collection: collDto, total: count, items, page: p, limit: l, locale });
  }

  return res.json({ collection: collDto, total: 0, items: [], page: p, limit: l, locale });
});

export default { listItemsByKey };

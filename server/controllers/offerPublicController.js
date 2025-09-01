import asyncHandler from '../utils/asyncHandler.js';
import Offer from '../models/Offer.js';
import Store from '../models/Store.js';
import ProductVariant from '../models/ProductVariant.js';
import Product from '../models/Product.js';
import Media from '../models/Media.js';

export const listPublic = asyncHandler(async (req, res) => {
  const { page = '1', limit = '50' } = req.query;
  const p = Math.max(parseInt(page, 10) || 1, 1);
  const l = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);

  const { count, rows } = await Offer.findAndCountAll({
    where: { isActive: true },
    include: [
      {
        model: Store,
        as: 'store',
        required: true,
        attributes: ['id', 'name', 'slug'],
        where: { isActive: true },
      },
      {
        model: ProductVariant,
        as: 'variant',
        required: true,
        attributes: ['id', 'sku'],
        include: [
          {
            model: Product,
            as: 'product',
            required: true,
            attributes: ['id', 'name'],
            include: [
              {
                model: Media,
                as: 'media',
                required: false,
                attributes: ['id', 'url', 'position'],
              },
            ],
          },
        ],
      },
    ],
    order: [['id', 'DESC']],
    limit: l,
    offset: (p - 1) * l,
  });

  res.json({ total: count, items: rows });
});

export default { listPublic };

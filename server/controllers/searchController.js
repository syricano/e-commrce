import { Op } from 'sequelize';
import asyncHandler from '../utils/asyncHandler.js';
import Listing from '../models/Listing.js';
import ListingTranslation from '../models/ListingTranslation.js';
import Product from '../models/Product.js';
import ProductTranslation from '../models/ProductTranslation.js';
import StoreProduct from '../models/StoreProduct.js';

export const search = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return res.json({ listings: [], products: [], storeProducts: [] });
  const like = '%' + q + '%';

  const listings = await ListingTranslation.findAll({
    where: { [Op.or]: [{ title: { [Op.iLike]: like } }, { description: { [Op.iLike]: like } }] },
    include: [{ model: Listing, as: 'listing', where: { status: 'active' }, required: true }],
    limit: 50,
  });

  const products = await ProductTranslation.findAll({
    where: { [Op.or]: [{ name: { [Op.iLike]: like } }, { shortDescription: { [Op.iLike]: like } }] },
    include: [{ model: Product, as: 'product', where: { isActive: true }, required: true }],
    limit: 50,
  });

  const storeProducts = await StoreProduct.findAll({
    where: { [Op.or]: [{ name: { [Op.iLike]: like } }, { articleNumber: { [Op.iLike]: like } }] },
    order: [['id','DESC']],
    limit: 50,
  });

  res.json({ listings, products, storeProducts });
});

// alias for existing routers expecting unifiedSearch
export const unifiedSearch = search;

export default { search, unifiedSearch };

// server/controllers/nearbyListingsController.js
import { Op, Sequelize } from 'sequelize';
import asyncHandler from '../utils/asyncHandler.js';
import { parsePageLimit } from '../utils/paging.js';
import Listing from '../models/Listing.js';
import ListingTranslation from '../models/ListingTranslation.js';
import { clamp } from '../utils/number.js';

export const nearbyListings = asyncHandler(async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  const radiusKm = clamp(parseFloat(req.query.radiusKm || '10'), 1, 200);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return res.status(400).json({ error: 'lat and lng required' });

  const { page, limit } = parsePageLimit(req.query, 50, 200);

  const hav = Sequelize.literal(
    `(6371 * acos(cos(radians(${lat})) * cos(radians(CAST(location_lat AS DOUBLE PRECISION))) * cos(radians(CAST(location_lng AS DOUBLE PRECISION)) - radians(${lng})) + sin(radians(${lat})) * sin(radians(CAST(location_lat AS DOUBLE PRECISION)))))`
  );

  const { count, rows } = await Listing.findAndCountAll({
    where: { status: 'active' },
    attributes: { include: [[hav, 'distance_km']] },
    include: [{ model: ListingTranslation, as: 'translations', required: false }],
    having: Sequelize.where(hav, { [Op.lte]: radiusKm }),
    order: Sequelize.literal('distance_km ASC'),
    limit,
    offset: (page - 1) * limit,
  });

  res.json({ total: count, items: rows, page, limit, radiusKm });
});

export default { nearbyListings };

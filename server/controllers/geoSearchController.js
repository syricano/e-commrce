import { Op, Sequelize } from 'sequelize';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import Listing from '../models/Listing.js';
import ListingTranslation from '../models/ListingTranslation.js';

export const nearbyListings = asyncHandler(async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  const radiusKm = parseFloat(req.query.radiusKm || '10');
  if (Number.isNaN(lat) || Number.isNaN(lng)) throw new ErrorResponse('lat and lng required', 400);

  const hav = Sequelize.literal(
    `(6371 * acos(cos(radians(${lat})) * cos(radians(CAST(location_lat AS DOUBLE PRECISION))) * cos(radians(CAST(location_lng AS DOUBLE PRECISION)) - radians(${lng})) + sin(radians(${lat})) * sin(radians(CAST(location_lat AS DOUBLE PRECISION)))))`
  );

  const rows = await Listing.findAll({
    where: { status: 'active' },
    attributes: { include: [[hav, 'distance_km']] },
    include: [{ model: ListingTranslation, as: 'translations', required: false }],
    having: Sequelize.where(hav, { [Op.lte]: radiusKm }),
    order: Sequelize.literal('distance_km ASC'),
    limit: parseInt(req.query.limit || '50', 10),
  });

  res.json(rows);
});

export default { nearbyListings };

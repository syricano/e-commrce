import Offer from '../models/Offer.js';
import buildCrud from './crudFactory.js';
export const { getAll: getAllOffers, getById: getOfferById, createOne: createOffer, updateOne: updateOffer, deleteOne: deleteOffer } =
  buildCrud(Offer, { modelName: 'Offer' });

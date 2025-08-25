import Offer from '../models/Offer.js';
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';

export const listOffers = list(Offer);
export const getOffer = getById(Offer);
export const createOffer = createOne(Offer);
export const updateOffer = updateById(Offer);
export const deleteOffer = deleteById(Offer);

export default { listOffers, getOffer, createOffer, updateOffer, deleteOffer };

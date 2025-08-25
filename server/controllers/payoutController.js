import Payout from '../models/Payout.js';
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';

export const listPayouts = list(Payout);
export const getPayout = getById(Payout);
export const createPayout = createOne(Payout);
export const updatePayout = updateById(Payout);
export const deletePayout = deleteById(Payout);

export default { listPayouts, getPayout, createPayout, updatePayout, deletePayout };

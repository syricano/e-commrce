import Payout from '../models/Payout.js';
import buildCrud from './crudFactory.js';
export const { getAll: getAllPayouts, getById: getPayoutById, createOne: createPayout, updateOne: updatePayout, deleteOne: deletePayout } =
  buildCrud(Payout, { modelName: 'Payout' });

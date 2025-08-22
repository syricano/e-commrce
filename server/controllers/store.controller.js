import Store from '../models/Store.js';
import buildCrud from './crudFactory.js';
export const { getAll: getAllStores, getById: getStoreById, createOne: createStore, updateOne: updateStore, deleteOne: deleteStore } =
  buildCrud(Store, { modelName: 'Store' });

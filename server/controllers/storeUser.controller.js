import StoreUser from '../models/StoreUser.js';
import buildCrud from './crudFactory.js';
export const { getAll: getAllStoreUsers, getById: getStoreUserById, createOne: createStoreUser, updateOne: updateStoreUser, deleteOne: deleteStoreUser } =
  buildCrud(StoreUser, { modelName: 'StoreUser' });

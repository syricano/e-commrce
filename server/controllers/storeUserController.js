import StoreUser from '../models/StoreUser.js';
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';

export const listStoreUsers = list(StoreUser);
export const getStoreUser = getById(StoreUser);
export const createStoreUser = createOne(StoreUser);
export const updateStoreUser = updateById(StoreUser);
export const deleteStoreUser = deleteById(StoreUser);

export default { listStoreUsers, getStoreUser, createStoreUser, updateStoreUser, deleteStoreUser };

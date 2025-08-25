import Store from '../models/Store.js';
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';

export const listStores = list(Store);
export const getStore = getById(Store);
export const createStore = createOne(Store);
export const updateStore = updateById(Store);
export const deleteStore = deleteById(Store);

export default { listStores, getStore, createStore, updateStore, deleteStore };

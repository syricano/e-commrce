import Collection from '../models/Collection.js';
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';

export const listCollections = list(Collection);
export const getCollection = getById(Collection);
export const createCollection = createOne(Collection);
export const updateCollection = updateById(Collection);
export const deleteCollection = deleteById(Collection);

export default { listCollections, getCollection, createCollection, updateCollection, deleteCollection };

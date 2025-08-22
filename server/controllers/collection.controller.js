import Collection from '../models/Collection.js';
import buildCrud from './crudFactory.js';
export const { getAll: getAllCollections, getById: getCollectionById, createOne: createCollection, updateOne: updateCollection, deleteOne: deleteCollection } =
  buildCrud(Collection, { modelName: 'Collection' });

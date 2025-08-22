import CollectionTranslation from '../models/CollectionTranslation.js';
import buildCrud from './crudFactory.js';
export const { getAll: getAllCollectionTranslations, getById: getCollectionTranslationById, createOne: createCollectionTranslation, updateOne: updateCollectionTranslation, deleteOne: deleteCollectionTranslation } =
  buildCrud(CollectionTranslation, { modelName: 'CollectionTranslation' });

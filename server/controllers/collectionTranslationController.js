import CollectionTranslation from '../models/CollectionTranslation.js';
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';

export const listCollectionTranslations = list(CollectionTranslation);
export const getCollectionTranslation = getById(CollectionTranslation);
export const createCollectionTranslation = createOne(CollectionTranslation);
export const updateCollectionTranslation = updateById(CollectionTranslation);
export const deleteCollectionTranslation = deleteById(CollectionTranslation);

export default { listCollectionTranslations, getCollectionTranslation, createCollectionTranslation, updateCollectionTranslation, deleteCollectionTranslation };

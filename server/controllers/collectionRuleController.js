import CollectionRule from '../models/CollectionRule.js';
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';

export const listCollectionRules = list(CollectionRule);
export const getCollectionRule = getById(CollectionRule);
export const createCollectionRule = createOne(CollectionRule);
export const updateCollectionRule = updateById(CollectionRule);
export const deleteCollectionRule = deleteById(CollectionRule);

export default { listCollectionRules, getCollectionRule, createCollectionRule, updateCollectionRule, deleteCollectionRule };

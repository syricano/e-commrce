import CollectionRule from '../models/CollectionRule.js';
import buildCrud from './crudFactory.js';
export const { getAll: getAllCollectionRules, getById: getCollectionRuleById, createOne: createCollectionRule, updateOne: updateCollectionRule, deleteOne: deleteCollectionRule } =
  buildCrud(CollectionRule, { modelName: 'CollectionRule' });

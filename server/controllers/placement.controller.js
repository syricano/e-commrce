import Placement from '../models/Placement.js';
import buildCrud from './crudFactory.js';
export const { getAll: getAllPlacements, getById: getPlacementById, createOne: createPlacement, updateOne: updatePlacement, deleteOne: deletePlacement } =
  buildCrud(Placement, { modelName: 'Placement' });

import Media from '../models/Media.js';
import buildCrud from './crudFactory.js';
export const { getAll: getAllMedia, getById: getMediaById, createOne: createMedia, updateOne: updateMedia, deleteOne: deleteMedia } =
  buildCrud(Media, { modelName: 'Media' });

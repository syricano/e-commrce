import Media from '../models/Media.js';
import { list, getById, createOne, updateById, deleteById } from './crudFactory.js';

export const listMedias = list(Media);
export const getMedia = getById(Media);
export const createMedia = createOne(Media);
export const updateMedia = updateById(Media);
export const deleteMedia = deleteById(Media);

export default { listMedias, getMedia, createMedia, updateMedia, deleteMedia };

// client/src/api/adminCollections.js
import axiosInstance from '@/config/axiosConfig';
import { asyncHandler } from '@/utils';

/** Collections (with translations) */
export const listCollections = (params = {}) =>
  asyncHandler(
    () => axiosInstance.get('/collections', { params }),
    'Failed to load collections'
  )();

/** Collection items (manual picks) */
export const listCollectionItems = (params) =>
  asyncHandler(
    () => axiosInstance.get('/collection-items', { params }),
    'Failed to load collection items'
  )();

export const createCollectionItem = (data) =>
  asyncHandler(
    () => axiosInstance.post('/collection-items', data),
    'Failed to create collection item'
  )();

export const updateCollectionItem = (id, data) =>
  asyncHandler(
    () => axiosInstance.put(`/collection-items/${id}`, data),
    `Failed to update collection item #${id}`
  )();

export const deleteCollectionItem = (id) =>
  asyncHandler(
    () => axiosInstance.delete(`/collection-items/${id}`),
    `Failed to delete collection item #${id}`
  )();

export default {
  listCollections,
  listCollectionItems,
  createCollectionItem,
  updateCollectionItem,
  deleteCollectionItem,
};

// client/services/crudFactory.js
import axiosInstance from '@/config/axiosConfig';
import { asyncHandler } from '@/utils';

export const createCrud = (base) => ({
  list:   (params)   => asyncHandler(() => axiosInstance.get(base, { params }), `Failed to fetch ${base}`)(),
  get:    (id)       => asyncHandler(() => axiosInstance.get(`${base}/${id}`), `Failed to fetch ${base}/${id}`)(),
  create: (data)     => asyncHandler(() => axiosInstance.post(base, data), `Failed to create in ${base}`)(),
  update: (id, data) => asyncHandler(() => axiosInstance.put(`${base}/${id}`, data), `Failed to update ${base}/${id}`)(),
  remove: (id)       => asyncHandler(() => axiosInstance.delete(`${base}/${id}`), `Failed to delete ${base}/${id}`)(),
});

export default createCrud;

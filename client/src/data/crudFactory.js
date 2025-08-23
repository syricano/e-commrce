import axiosInstance from '@/config/axiosConfig';
import { asyncHandler } from '@/utils';

export const createCrud = (baseURL) => ({
  list: (params) => asyncHandler(() => axiosInstance.get(baseURL, { params }), `Failed to fetch ${baseURL}`),
  get:   (id)    => asyncHandler(() => axiosInstance.get(`${baseURL}/${id}`), `Failed to fetch ${baseURL}/${id}`),
  create:(data)  => asyncHandler(() => axiosInstance.post(baseURL, data), `Failed to create in ${baseURL}`),
  update:(id,d)  => asyncHandler(() => axiosInstance.put(`${baseURL}/${id}`, d), `Failed to update ${baseURL}/${id}`),
  remove:(id)    => asyncHandler(() => axiosInstance.delete(`${baseURL}/${id}`), `Failed to delete ${baseURL}/${id}`)
});

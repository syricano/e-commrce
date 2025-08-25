import axiosInstance from '@/config/axiosConfig';
import { asyncHandler } from '@/utils';

export const getAdminStats = () =>
  asyncHandler(() => axiosInstance.get('/admin/dashboard'), 'Failed to load stats')();

export const adminSearchUsers = (params) =>
  asyncHandler(() => axiosInstance.get('/admin/users', { params }), 'Failed to search users')();

export const adminUpdateUserRoleStatus = (id, payload) =>
  asyncHandler(() => axiosInstance.put(`/admin/users/${id}/role-status`, payload), 'Failed to update user role/status')();

export const adminUpdateUser = (id, payload) =>
  asyncHandler(() => axiosInstance.put(`/users/${id}`, payload), 'Failed to update user')();

export const adminSuspendUser = (id) =>
  asyncHandler(() => axiosInstance.post(`/admin/users/${id}/suspend`), 'Failed to suspend user')();

export const adminDeleteUser = (id) =>
  asyncHandler(() => axiosInstance.delete(`/users/${id}`), 'Failed to delete user')();

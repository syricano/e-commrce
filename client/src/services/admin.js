import axiosInstance from '@/config/axiosConfig';
import { asyncHandler } from '@/utils';

export const getAdminStats = () =>
  asyncHandler(() => axiosInstance.get('/admin/dashboard'), 'Failed to load stats')();

export const adminSearchUsers = (params) =>
  asyncHandler(() => axiosInstance.get('/admin/users', { params }), 'Failed to search users')();

export const adminUpdateUserRoleStatus = (id, payload) =>
  asyncHandler(() => axiosInstance.put(`/admin/users/${id}/role-status`, payload), 'Failed to update user role/status')();

export const adminUpdateUser = (id, payload) =>
  asyncHandler(() => axiosInstance.put(`/admin/users/${id}`, payload), 'Failed to update user')();

export const adminSuspendUser = (id) =>
  asyncHandler(() => axiosInstance.post(`/admin/users/${id}/suspend`), 'Failed to suspend user')();

export const adminDeleteUser = (id) =>
  asyncHandler(() => axiosInstance.delete(`/admin/users/${id}`), 'Failed to delete user')();

// Products moderation
export const adminModerateProduct = (id, payload) =>
  asyncHandler(() => axiosInstance.post(`/admin/products/${id}/moderate`, payload), 'Failed to moderate product')();

// Listings moderation
export const adminModerateListing = (id, payload) =>
  asyncHandler(() => axiosInstance.post(`/admin/listings/${id}/moderate`, payload), 'Failed to moderate listing')();

// Reports
export const adminListReports = (params) =>
  asyncHandler(() => axiosInstance.get('/admin/reports', { params }), 'Failed to load reports')();
export const adminReviewReport = (id, payload) =>
  asyncHandler(() => axiosInstance.post(`/admin/reports/${id}/review`, payload), 'Failed to review report')();

// Stores / commissions
export const adminAssignCommission = (storeId, payload) =>
  asyncHandler(() => axiosInstance.put(`/admin/stores/${storeId}/commission`, payload), 'Failed to set commission')();

// Seller (C2C) checkout settings
export const adminGetSellerSettings = (userId) =>
  asyncHandler(() => axiosInstance.get(`/admin/users/${userId}/seller-settings`), 'Failed to load seller settings')();
export const adminUpdateSellerSettings = (userId, payload) =>
  asyncHandler(() => axiosInstance.put(`/admin/users/${userId}/seller-settings`, payload), 'Failed to update seller settings')();

// Payouts
export const adminUpdatePayoutStatus = (id, payload) =>
  asyncHandler(() => axiosInstance.put(`/admin/payouts/${id}/status`, payload), 'Failed to update payout')();

// Impersonation
export const adminImpersonate = (userId) =>
  asyncHandler(() => axiosInstance.post('/admin/impersonate', { userId }), 'Failed to impersonate')();

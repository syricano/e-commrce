import axiosInstance from '@/config/axiosConfig';
import { asyncHandler } from '@/utils';

export const getMerchantStore = (id) =>
  asyncHandler(() => axiosInstance.get(`/merchant/stores/${id}`), 'فشل في تحميل بيانات المتجر')();

export const updateMerchantSettings = (id, payload) =>
  asyncHandler(() => axiosInstance.put(`/merchant/stores/${id}/settings`, payload), 'فشل في حفظ إعدادات المتجر')();

export default { getMerchantStore, updateMerchantSettings };

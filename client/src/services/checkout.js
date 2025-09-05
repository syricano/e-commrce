import axiosInstance from '@/config/axiosConfig';
import { asyncHandler } from '@/utils';

export const getCheckoutOptions = () =>
  asyncHandler(() => axiosInstance.get('/checkout/options'), 'فشل في تحميل خيارات الدفع والشحن')();

export const placeOrder = (payload) =>
  asyncHandler(() => axiosInstance.post('/checkout/place', payload), 'فشل في إتمام الطلب')();

export default { getCheckoutOptions, placeOrder };

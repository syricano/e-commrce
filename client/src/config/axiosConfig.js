import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true, // send/receive cookies
});

// Set or change the UI language header. Defaults to Arabic.
export const setAxiosLocale = (lang) => {
  const v = lang || 'ar';
  axiosInstance.defaults.headers.common['Accept-Language'] = v;
  try { localStorage.setItem('lang', v); } catch {}
};

// Init from saved lang or fallback to 'ar'
setAxiosLocale(typeof localStorage !== 'undefined' ? localStorage.getItem('lang') : 'ar');

// Attach bearer from localStorage and ensure Accept-Language on every request
axiosInstance.interceptors.request.use((config) => {
  const t = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  if (t && !config.headers?.Authorization) {
    config.headers = { ...(config.headers || {}), Authorization: `Bearer ${t}` };
  }
  if (!config.headers?.['Accept-Language']) {
    config.headers = {
      ...(config.headers || {}),
      'Accept-Language':
        axiosInstance.defaults.headers.common['Accept-Language'] || 'ar',
    };
  }
  return config;
});

export default axiosInstance;

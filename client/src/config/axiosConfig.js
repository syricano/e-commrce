import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true, // send/receive cookies
});

// attach bearer from localStorage on every request
axiosInstance.interceptors.request.use((config) => {
  const t = localStorage.getItem('token');
  if (t && !config.headers?.Authorization) {
    config.headers = { ...(config.headers || {}), Authorization: `Bearer ${t}` };
  }
  return config;
});

export default axiosInstance;

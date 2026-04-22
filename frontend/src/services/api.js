import axios from 'axios';
import useAuthStore from '../store/authStore';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 60000,
});

API.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failQueue = [];
const processQueue = (error, token = null) => {
  failQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failQueue = [];
};

API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => failQueue.push({ resolve, reject }))
          .then((token) => { original.headers.Authorization = `Bearer ${token}`; return API(original); });
      }
      original._retry = true;
      isRefreshing = true;
      const refreshToken = useAuthStore.getState().refreshToken;
      try {
        const res = await axios.post(`${API.defaults.baseURL}/auth/refresh`, { refreshToken });
        const newToken = res.data.accessToken;
        useAuthStore.getState().setAccessToken(newToken);
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return API(original);
      } catch (err) {
        processQueue(err, null);
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const loginApi = (data) => API.post('/auth/login', data);
export const registerApi = (data) => API.post('/auth/register', data);
export const logoutApi = (data) => API.post('/auth/logout', data);
export const getMeApi = () => API.get('/auth/me');

// Rooms
export const getRoomsApi = () => API.get('/rooms');
export const getRoomApi = (id) => API.get(`/rooms/${id}`);
export const createRoomApi = (data) => API.post('/rooms', data);
export const updateRoomApi = (id, data) => API.put(`/rooms/${id}`, data);
export const deleteRoomApi = (id) => API.delete(`/rooms/${id}`);

// Tenants
export const getTenantsApi = (params) => API.get('/tenants', { params });
export const getTenantApi = (id) => API.get(`/tenants/${id}`);
export const createTenantApi = (data) => API.post('/tenants', data);
export const updateTenantApi = (id, data) => API.put(`/tenants/${id}`, data);
export const deleteTenantApi = (id) => API.delete(`/tenants/${id}`);
export const uploadTenantFileApi = (id, formData) => API.post(`/tenants/${id}/files`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteTenantFileApi = (tenantId, fileId) => API.delete(`/tenants/${tenantId}/files/${fileId}`);

// Invoices
export const getInvoicesApi = (params) => API.get('/invoices', { params });
export const getInvoiceApi = (id) => API.get(`/invoices/${id}`);
export const createInvoiceApi = (data) => API.post('/invoices', data);
export const bulkCreateInvoicesApi = (data) => API.post('/invoices/bulk-create', data);
export const updateInvoiceApi = (id, data) => API.put(`/invoices/${id}`, data);
export const deleteInvoiceApi = (id) => API.delete(`/invoices/${id}`);
export const markInvoicePaidApi = (id, data) => API.put(`/invoices/${id}/pay`, data);
export const getInvoicePdfApi = (id) => API.get(`/invoices/${id}/pdf`, { responseType: 'blob' });

// Dashboard
export const getDashboardSummaryApi = () => API.get('/dashboard/summary');
export const getUnpaidInvoicesApi = () => API.get('/dashboard/unpaid');
export const getExpiringTenantsApi = () => API.get('/dashboard/expiring');
export const getRevenueChartApi = () => API.get('/dashboard/revenue-chart');
export const getOccupancyChartApi = () => API.get('/dashboard/occupancy-chart');

// Settings
export const getSettingsApi = () => API.get('/settings');
export const updateSettingsApi = (data) => API.put('/settings', data);

// Export
export const exportInvoicesCsvApi = (year) => API.get(`/export/invoices?year=${year}`, { responseType: 'blob' });

export default API;

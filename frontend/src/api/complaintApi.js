import axios from 'axios';

const COMPLAINT_API_URL = import.meta.env.VITE_COMPLAINT_API_URL || 'http://localhost:3002';

const api = axios.create({
  baseURL: COMPLAINT_API_URL,
});

// Interceptor to automatically add admin token to headers
api.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const submitComplaint = async (formData) => {
  const response = await api.post('/api/complaints', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getComplaint = async (id) => {
  const response = await api.get(`/api/complaints/${id}`);
  return response.data;
};

export const checkMailbox = async (mailboxId) => {
  const response = await api.get(`/api/mailbox/${mailboxId}`);
  return response.data;
};

export const sendMailboxReply = async (mailboxId, content) => {
  const response = await api.post(`/api/mailbox/${mailboxId}/reply`, { content });
  return response.data;
};

export const adminLogin = async (username, password) => {
  const response = await api.post('/api/admin/login', { username, password });
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await api.get('/api/dashboard/stats');
  return response.data;
};

export const getDashboardHeatmap = async () => {
  const response = await api.get('/api/dashboard/heatmap');
  return response.data;
};

export const getDashboardComplaints = async () => {
  const response = await api.get('/api/dashboard/complaints');
  return response.data;
};

export const updateComplaintStatus = async (complaintId, status) => {
  const response = await api.patch(`/api/complaints/${complaintId}/status`, { status });
  return response.data;
};
export default api;

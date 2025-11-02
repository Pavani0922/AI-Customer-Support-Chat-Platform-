import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Don't set Content-Type for FormData (browser will set it with boundary)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  register: async (username, password, role = 'user') => {
    const response = await api.post('/auth/register', { username, password, role });
    return response.data;
  }
};

// Chat API
export const chatAPI = {
  sendMessage: async (message, sessionId) => {
    const response = await api.post('/chat/message', { message, sessionId });
    return response.data;
  },
  getConversations: async () => {
    const response = await api.get('/chat/conversations');
    return response.data;
  },
  getConversation: async (id) => {
    const response = await api.get(`/chat/conversations/${id}`);
    return response.data;
  }
};

// Admin API
export const adminAPI = {
  uploadFAQ: async (title, content, file = null) => {
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    if (title) formData.append('title', title);
    if (content) formData.append('content', content);
    
    const response = await api.post('/admin/upload', formData);
    return response.data;
  },
  getFAQs: async () => {
    const response = await api.get('/admin/data');
    return response.data;
  },
  deleteFAQ: async (id) => {
    const response = await api.delete(`/admin/data/${id}`);
    return response.data;
  }
};

export default api;



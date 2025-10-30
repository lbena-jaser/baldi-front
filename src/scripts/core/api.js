import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (add auth token)
api.interceptors.request.use(
  (config) => {
    // Get auth manager (avoid circular dependency)
    const authManager = window.__authManager__;
    
    if (authManager) {
      const token = authManager.getAccessToken();
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (handle errors)
api.interceptors.response.use(
  (response) => {
    return response.data; // Return just the data
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Get auth manager
        const authManager = window.__authManager__;
        
        if (authManager) {
          // Try to refresh token
          await authManager.refreshAccessToken();
          
          // Retry original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        const authManager = window.__authManager__;
        
        if (authManager) {
          authManager.logout();
        }
        
        // Redirect to login
        window.location.href = '/login.html';
        return Promise.reject(refreshError);
      }
    }
    
    // Handle network errors
    if (!error.response) {
      // Show toast if available
      if (window.__showToast__) {
        window.__showToast__('Network error. Please check your connection.', 'error');
      }
      
      return Promise.reject(error);
    }
    
    // Handle other errors
    const message = error.response?.data?.error || 'An error occurred';
    
    // Don't show toast for validation errors (handled by forms)
    if (error.response?.status !== 422) {
      if (window.__showToast__) {
        window.__showToast__(message, 'error');
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
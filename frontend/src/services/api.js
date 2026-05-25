import axios from 'axios';

// Create central Axios instance pointing to Vite server base (/api proxies to Spring Boot)
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request Interceptor: Automatically inject JWT Bearer token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('df_token');
    if (token && token !== 'undefined') {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle JWT sessions expirations
api.interceptors.response.use(
  (response) => {
    return response.data; // Unpack Spring Boot's ApiResponse envelope immediately
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and user details on expiration
      localStorage.removeItem('df_token');
      localStorage.removeItem('df_user');
      
      // Force direct redirection to login page
      window.location.href = '#/login';
      window.location.reload();
    }
    
    // Unpack specific API error messages from Spring envelope
    const apiError = error.response?.data?.message || error.message || 'API request failed';
    return Promise.reject(new Error(apiError));
  }
);

export default api;

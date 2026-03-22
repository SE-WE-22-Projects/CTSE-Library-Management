import axios from 'axios';

// Base Axios instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8082',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for attaching auth tokens, etc.
api.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle global errors here
    return Promise.reject(error);
  }
);

import { apiClient } from './axios';
import { User } from '../store/authStore';

export const authApi = {
  login: async (data: any) => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },
  register: async (data: any) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },
};

export const booksApi = {
  getAll: async () => {
    const response = await apiClient.get('/books');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/books/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await apiClient.post('/books', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/books/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/books/${id}`);
    return response.data;
  },
};

export const lendingsApi = {
  getAll: async () => {
    const response = await apiClient.get('/lending');
    return response.data;
  },
  create: async (data: { bookId: string; userId: string }) => {
    const response = await apiClient.post('/lending', data);
    return response.data;
  },
  getUserHistory: async (userId: string) => {
    const response = await apiClient.get(`/lending/history/user/${userId}`);
    return response.data;
  },
  extend: async (id: string) => {
    const response = await apiClient.patch(`/lending/${id}/extend`);
    return response.data;
  },
  returnBook: async (id: string) => {
    const response = await apiClient.patch(`/lending/${id}/return`);
    return response.data;
  },
};

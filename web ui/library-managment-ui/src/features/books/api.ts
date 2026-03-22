import { api } from '@/lib/axios';
import type { Book, CreateBookDto, UpdateBookDto } from './types';

// Depending on your API Gateway setup, the path might be different, but we'll use the controller path.
const BASE_URL = '/api/books';

export const booksApi = {
  getBooks: async (search?: string, category?: string): Promise<Book[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    
    // Send API request to API Gateway
    const response = await api.get<never, Book[]>(BASE_URL, { params });
    // Assuming backend returns an array directly, based on controller logic
    return response;
  },

  getBookById: async (id: string): Promise<Book> => {
    const response = await api.get<never, Book>(`${BASE_URL}/${id}`);
    return response;
  },

  getBooksByCategory: async (category: string): Promise<Book[]> => {
    const response = await api.get<never, Book[]>(`${BASE_URL}/category/${category}`);
    return response;
  },

  createBook: async (data: CreateBookDto): Promise<Book> => {
    const response = await api.post<never, Book>(BASE_URL, data);
    return response;
  },

  updateBook: async (id: string, data: UpdateBookDto): Promise<Book> => {
    const response = await api.put<never, Book>(`${BASE_URL}/${id}`, data);
    return response;
  },

  deleteBook: async (id: string): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
  },
};

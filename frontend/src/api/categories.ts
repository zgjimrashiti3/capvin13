import api from './client';
import type { Category } from '../types';

export const getCategories = () => api.get<Category[]>('/categories').then((r) => r.data);

export const createCategory = (data: Partial<Category>) =>
  api.post<Category>('/categories', data).then((r) => r.data);

export const updateCategory = (id: string, data: Partial<Category>) =>
  api.patch<Category>(`/categories/${id}`, data).then((r) => r.data);

export const deleteCategory = (id: string) => api.delete(`/categories/${id}`);

export const toggleCategory = (id: string) =>
  api.patch<Category>(`/categories/${id}/toggle`).then((r) => r.data);

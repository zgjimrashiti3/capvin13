import api from './client';
import type { MenuItem, CategoryWithItems } from '../types';

export const getMenuGrouped = () =>
  api.get<CategoryWithItems[]>('/menu-items/all').then((r) => r.data);

export const getMenuItems = (categoryId?: string) =>
  api.get<MenuItem[]>('/menu-items', { params: categoryId ? { categoryId } : {} }).then((r) => r.data);

export const createMenuItem = (data: Partial<MenuItem>) =>
  api.post<MenuItem>('/menu-items', data).then((r) => r.data);

export const updateMenuItem = (id: string, data: Partial<MenuItem>) =>
  api.patch<MenuItem>(`/menu-items/${id}`, data).then((r) => r.data);

export const deleteMenuItem = (id: string) => api.delete(`/menu-items/${id}`);

export const toggleMenuItem = (id: string) =>
  api.patch<MenuItem>(`/menu-items/${id}/toggle`).then((r) => r.data);

export const uploadImage = (file: File) => {
  const form = new FormData();
  form.append('file', file);
  return api.post<{ url: string }>('/upload/image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);
};

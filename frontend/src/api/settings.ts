import api from './client';

export interface AppSettings {
  showImages: boolean;
}

export const getSettings = () => api.get<AppSettings>('/settings').then((r) => r.data);

export const updateSettings = (data: Partial<AppSettings>) =>
  api.patch<AppSettings>('/settings', data).then((r) => r.data);

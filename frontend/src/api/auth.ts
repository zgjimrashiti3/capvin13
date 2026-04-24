import api from './client';
import type { AuthResponse } from '../types';

export const login = (username: string, password: string) =>
  api.post<AuthResponse>('/auth/login', { username, password }).then((r) => r.data);

export const getMe = () => api.get('/auth/me').then((r) => r.data);

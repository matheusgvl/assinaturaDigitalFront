import { api } from './api'; import type { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from '../types/auth';
// Contract implemented by the backend under /api/v1/auth.
export const authService = { register: (payload: RegisterRequest) => api.post<void>('/auth/register', payload), login: async (payload: LoginRequest) => { const response = await api.post<AuthResponse>('/auth/login', payload); return response.data; }, me: () => api.get<AuthUser>('/auth/me'), logout: () => api.post<void>('/auth/logout') };

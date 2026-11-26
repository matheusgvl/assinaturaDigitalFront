import { api } from './api'; import type { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from '../types/auth';
// Endpoint paths are provisional until the backend contract is published.
export const authService = { register: (payload: RegisterRequest) => api.post<void>('/auth/register', payload), login: async (payload: LoginRequest) => { const response = await api.post<AuthResponse>('/auth/login', payload); return response.data; }, me: () => api.get<AuthUser>('/auth/me'), logout: () => api.post<void>('/auth/logout') };

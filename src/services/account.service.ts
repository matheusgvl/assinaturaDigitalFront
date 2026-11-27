import { api } from './api';
import type { SecurityAlert } from '../types/security';

// Todas as rotas exigem sessão autenticada e proteção CSRF do cliente HTTP.
export const accountService = {
  changePassword: (payload: { currentPassword: string; newPassword: string }) => api.post<void>('/auth/password', payload),
  // A senha atual e o TOTP atual impedem que uma sessão roubada reduza a proteção da conta.
  disableTotp: (payload: { currentPassword: string; code: string }) => api.post<void>('/auth/totp/disable', payload),
  listAlerts: () => api.get<SecurityAlert[]>('/auth/alerts'),
  markAlertsRead: (ids: string[]) => api.post<void>('/auth/alerts/read', { ids }),
};

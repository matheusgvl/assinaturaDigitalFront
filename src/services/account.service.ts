import { api } from './api';
import type { SecurityAlert } from '../types/security';

// Provisional paths; all require an authenticated session.
export const accountService = {
  changePassword: (payload: { currentPassword: string; newPassword: string }) => api.post<void>('/auth/password', payload),
  // Disabling the second factor requires a current code, so a hijacked session alone cannot remove it.
  disableTotp: (payload: { code: string }) => api.post<void>('/auth/totp/disable', payload),
  listAlerts: () => api.get<SecurityAlert[]>('/auth/alerts'),
  markAlertsRead: (ids: string[]) => api.post<void>('/auth/alerts/read', { ids }),
};

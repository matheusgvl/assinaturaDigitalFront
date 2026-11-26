import { api } from './api';
import type { ActiveSession, PasskeyDevice } from '../types/security';

const path = (base: string, id: string) => `${base}/${encodeURIComponent(id)}`;

// Provisional paths; all require an authenticated session.
export const securityService = {
  listPasskeys: () => api.get<PasskeyDevice[]>('/auth/passkeys'),
  revokePasskey: (id: string) => api.delete<void>(path('/auth/passkeys', id)),
  listSessions: () => api.get<ActiveSession[]>('/auth/sessions'),
  revokeSession: (id: string) => api.delete<void>(path('/auth/sessions', id)),
  revokeAllSessions: () => api.post<void>('/auth/sessions/revoke-all'),
};

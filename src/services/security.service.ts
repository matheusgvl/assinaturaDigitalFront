import { api } from './api';
import type { ActiveSession, PasskeyDevice } from '../types/security';

const path = (base: string, id: string) => `${base}/${encodeURIComponent(id)}`;

/** As operações sensíveis em passkeys também exigem a senha atual. */
export const securityService = {
  listPasskeys: () => api.get<PasskeyDevice[]>('/auth/passkeys'),
  renamePasskey: (id: string, name: string, currentPassword: string) =>
    api.put<void>(path('/auth/passkeys', id), { name, currentPassword }),
  revokePasskey: (id: string, currentPassword: string) =>
    api.delete<void>(path('/auth/passkeys', id), { data: { currentPassword } }),
  listSessions: () => api.get<ActiveSession[]>('/auth/sessions'),
  revokeSession: (id: string) => api.delete<void>(path('/auth/sessions', id)),
  revokeAllSessions: () => api.post<void>('/auth/sessions/revoke-all'),
};

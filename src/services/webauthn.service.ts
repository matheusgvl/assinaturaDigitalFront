import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/browser';
import type { PasskeyCeremony, PasskeyLoginResult } from '../types/webauthn';
import { api } from './api';

/** Envia ao backend o desafio correlacionado com a resposta do autenticador. */
export const webauthnService = {
  requestRegistrationOptions: (currentPassword: string) =>
    api.post<PasskeyCeremony<PublicKeyCredentialCreationOptionsJSON>>(
      '/auth/passkeys/registration/options', { currentPassword },
    ),
  confirmRegistration: (challengeId: string, credential: RegistrationResponseJSON) =>
    api.post<{ confirmed: true }>('/auth/passkeys/registration/verify', { challengeId, credential }),
  requestAuthenticationOptions: () =>
    api.post<PasskeyCeremony<PublicKeyCredentialRequestOptionsJSON>>(
      '/auth/passkeys/authentication/options',
    ),
  confirmAuthentication: (challengeId: string, credential: AuthenticationResponseJSON) =>
    api.post<PasskeyLoginResult>('/auth/passkeys/authentication/verify', { challengeId, credential }),
};

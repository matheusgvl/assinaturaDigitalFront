import { api } from './api'; import type { RecoveryCodesResponse, TotpConfirmationRequest, TotpLoginRequest, TotpSetupResponse, TotpVerificationResponse } from '../types/totp';
// These paths are provisional until the backend publishes its TOTP contract.
export const totpService = { startSetup: () => api.post<TotpSetupResponse>('/auth/totp/setup'), confirmSetup: (payload: TotpConfirmationRequest) => api.post<RecoveryCodesResponse>('/auth/totp/setup/confirm', payload), verifyLogin: (payload: TotpLoginRequest) => api.post<TotpVerificationResponse>('/auth/totp/login/verify', payload) };

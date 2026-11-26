export type TotpSetupResponse = { setupId: string; qrCodeDataUrl: string; expiresAt?: string };
export type TotpConfirmationRequest = { setupId: string; code: string };
export type TotpLoginRequest = { transactionId: string; code: string; recoveryCode?: string };
export type TotpVerificationResponse = { authenticated: boolean; requiresRecoveryCode?: boolean };
export type RecoveryCodesResponse = { codes: string[] };

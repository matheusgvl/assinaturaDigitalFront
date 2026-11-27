export type RegisterRequest = { name: string; email: string; password: string };
export type LoginRequest = { email: string; password: string };
export type AuthUser = { id: string; name: string; email: string; totpEnabled?: boolean };
// Provisional contract: no token is issued before the second factor (REQ-15); the refresh token comes only as a cookie (REQ-20).
export type AuthResponse = { accessToken?: string; requiresSecondFactor?: boolean; transactionId?: string };

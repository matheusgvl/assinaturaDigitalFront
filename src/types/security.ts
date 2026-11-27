// Provisional contracts until the backend publishes device and session endpoints (REQ-10, REQ-57).
export type PasskeyDevice = { id: string; name: string; createdAt: string; lastUsedAt?: string };
export type ActiveSession = { id: string; current: boolean; device?: string; userAgent?: string; ip?: string; createdAt: string; lastSeenAt?: string };
// Alert types mirror backend events; unknown types are still shown, labelled generically.
export type SecurityAlertType = 'new_ip' | 'password_changed' | 'totp_enabled' | 'totp_disabled' | 'invalid_totp';
export type SecurityAlert = { id: string; type: SecurityAlertType | string; createdAt: string; ip?: string; device?: string; read: boolean };

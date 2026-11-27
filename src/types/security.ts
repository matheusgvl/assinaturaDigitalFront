// Provisional contracts until the backend publishes device and session endpoints (REQ-10, REQ-57).
export type PasskeyDevice = { id: string; name: string; createdAt: string; lastUsedAt?: string };
export type ActiveSession = { id: string; current: boolean; device?: string; userAgent?: string; ip?: string; createdAt: string; lastSeenAt?: string };

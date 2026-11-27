export type RegisterRequest = { name: string; email: string; password: string };
export type LoginRequest = { email: string; password: string };
export type AuthUser = { id: string; name: string; email: string };
export type AuthResponse = { authenticated: boolean; requiresSecondFactor?: boolean; user?: AuthUser };

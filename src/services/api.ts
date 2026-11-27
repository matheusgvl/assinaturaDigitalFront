import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT_MS || 10000),
  withCredentials: true,
  // Double Submit Cookie (REQ-65): axios copies this readable cookie into the header on same-origin requests.
  xsrfCookieName: 'csrf_token',
  xsrfHeaderName: 'X-CSRF-Token',
});

// Access JWT lives only in memory: never in localStorage/sessionStorage, lost on reload and restored via refresh.
let accessToken: string | null = null;
export const setAccessToken = (token: string | null) => { accessToken = token; };
export const getAccessToken = () => accessToken;

const expiredListeners = new Set<() => void>();
export function onSessionExpired(listener: () => void) { expiredListeners.add(listener); return () => { expiredListeners.delete(listener); }; }

// Credential endpoints answer 401 for wrong input; refreshing there would hide the real error or loop.
const NO_REFRESH = ['/auth/refresh', '/auth/login', '/auth/logout', '/auth/totp/login/verify', '/auth/passkeys/authentication/options', '/auth/passkeys/authentication/verify', '/auth/passkeys/registration/options', '/auth/passkeys/registration/verify'];

let refreshing: Promise<string> | null = null;
// The refresh token travels only in the HttpOnly cookie (REQ-20); concurrent 401s share one refresh call.
export function refreshAccessToken(): Promise<string> {
  refreshing ??= api.post<{ accessToken: string }>('/auth/refresh')
    .then(response => { setAccessToken(response.data.accessToken); return response.data.accessToken; })
    .finally(() => { refreshing = null; });
  return refreshing;
}

api.interceptors.request.use(config => {
  if (accessToken) config.headers.set('Authorization', `Bearer ${accessToken}`);
  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config as RetriableConfig | undefined;
  if (error.response?.status !== 401 || !config || config._retried || NO_REFRESH.includes(config.url ?? '')) throw error;
  if (['put', 'delete'].includes(config.method ?? '') && config.url?.startsWith('/auth/passkeys/')) throw error;
  config._retried = true;
  try {
    await refreshAccessToken();
  } catch {
    setAccessToken(null);
    expiredListeners.forEach(listener => listener());
    throw error;
  }
  return api(config);
});

export function getApiErrorMessage(error: unknown): string { if (axios.isAxiosError(error)) return error.response?.data?.message ?? 'Não foi possível concluir a solicitação.'; return 'Ocorreu um erro inesperado.'; }

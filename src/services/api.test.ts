import { AxiosError, AxiosHeaders, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { api, getAccessToken, onSessionExpired, setAccessToken } from './api';

type Handler = (config: InternalAxiosRequestConfig) => { status: number; data?: unknown };
const originalAdapter = api.defaults.adapter;
let calls: InternalAxiosRequestConfig[] = [];

// Fake transport: lets the real interceptors run against scripted responses.
function useServer(handler: Handler) {
  api.defaults.adapter = (async (config: InternalAxiosRequestConfig) => {
    calls.push(config);
    const { status, data } = handler(config);
    const response = { status, data, statusText: '', headers: {}, config } as AxiosResponse;
    if (status >= 400) throw new AxiosError('fail', undefined, config, undefined, response);
    return response;
  }) as AxiosAdapter;
}
const auth = (config: InternalAxiosRequestConfig) => AxiosHeaders.from(config.headers).get('Authorization');

beforeEach(() => { calls = []; setAccessToken(null); });
afterEach(() => { api.defaults.adapter = originalAdapter; });

test('attaches the in-memory access token as a Bearer header', async () => {
  useServer(() => ({ status: 200, data: {} }));
  setAccessToken('abc');
  await api.get('/auth/me');
  expect(auth(calls[0])).toBe('Bearer abc');
});

test('refreshes once on 401 and retries with the new token', async () => {
  useServer(config => {
    if (config.url === '/auth/refresh') return { status: 200, data: { accessToken: 'new' } };
    return auth(config) === 'Bearer new' ? { status: 200, data: { ok: true } } : { status: 401 };
  });
  setAccessToken('old');
  const response = await api.get('/documents');
  expect(response.data).toEqual({ ok: true });
  expect(calls.map(call => call.url)).toEqual(['/documents', '/auth/refresh', '/documents']);
  expect(getAccessToken()).toBe('new');
});

test('concurrent 401s share a single refresh call', async () => {
  useServer(config => {
    if (config.url === '/auth/refresh') return { status: 200, data: { accessToken: 'new' } };
    return auth(config) === 'Bearer new' ? { status: 200 } : { status: 401 };
  });
  await Promise.all([api.get('/a'), api.get('/b'), api.get('/c')]);
  expect(calls.filter(call => call.url === '/auth/refresh')).toHaveLength(1);
});

test('clears the token and reports expiry when the refresh is rejected', async () => {
  useServer(() => ({ status: 401 }));
  const expired = vi.fn();
  const stop = onSessionExpired(expired);
  setAccessToken('old');
  await expect(api.get('/documents')).rejects.toBeInstanceOf(AxiosError);
  expect(getAccessToken()).toBeNull();
  expect(expired).toHaveBeenCalledTimes(1);
  stop();
});

test('does not refresh on credential endpoints or on 403', async () => {
  useServer(config => ({ status: config.url === '/forbidden' ? 403 : 401 }));
  await expect(api.post('/auth/login', {})).rejects.toBeInstanceOf(AxiosError);
  await expect(api.get('/forbidden')).rejects.toBeInstanceOf(AxiosError);
  expect(calls.some(call => call.url === '/auth/refresh')).toBe(false);
});

test('never writes tokens to browser storage', async () => {
  useServer(config => (config.url === '/auth/refresh' ? { status: 200, data: { accessToken: 'secret-jwt' } } : { status: 401 }));
  await api.get('/x').catch(() => undefined);
  expect(JSON.stringify({ ...localStorage, ...sessionStorage })).not.toContain('secret-jwt');
});

test('is configured for the double submit cookie CSRF strategy', () => {
  expect(api.defaults.xsrfCookieName).toBe('csrf_token');
  expect(api.defaults.xsrfHeaderName).toBe('X-CSRF-Token');
  expect(api.defaults.withCredentials).toBe(true);
});

import { render, screen } from '@testing-library/react';
import { AxiosError, AxiosHeaders, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, expect, test, vi } from 'vitest';
import { authService } from '../services/auth.service';
import { api } from '../services/api';
import { LoginForm } from '../components/auth/LoginForm';
import { DashboardPage } from '../pages/Pages';
import { RequireAuth, SessionProvider } from './session';

const httpError = (status: number) => new AxiosError('fail', undefined, undefined, undefined, { status, data: {}, statusText: '', headers: {}, config: { headers: new AxiosHeaders() } } as AxiosResponse);
const renderAt = (path: string) => render(<SessionProvider><MemoryRouter initialEntries={[path]}><Routes><Route path="/login" element={<p>Tela de login</p>} /><Route element={<RequireAuth />}><Route path="/dashboard" element={<DashboardPage />} /></Route></Routes></MemoryRouter></SessionProvider>);

beforeEach(() => { vi.restoreAllMocks(); });

test('shows loading while the session is checked', () => {
  vi.spyOn(authService, 'me').mockReturnValue(new Promise(() => undefined));
  renderAt('/dashboard');
  expect(screen.getByRole('status').textContent).toMatch(/verificando sessão/i);
});

test('redirects to login without a session and hides private content', async () => {
  vi.spyOn(authService, 'me').mockRejectedValue(httpError(401));
  renderAt('/dashboard');
  expect(await screen.findByText('Tela de login')).toBeTruthy();
  expect(screen.queryByText(/assinar documento/i)).toBeNull();
});

test('shows a retryable error when the API fails', async () => {
  vi.spyOn(authService, 'me').mockRejectedValue(httpError(500));
  renderAt('/dashboard');
  expect(await screen.findByRole('button', { name: /tentar novamente/i })).toBeTruthy();
});

test('renders dashboard shortcuts for an authenticated user', async () => {
  vi.spyOn(authService, 'me').mockResolvedValue({ data: { id: '1', name: 'Ana', email: 'ana@example.com' } } as AxiosResponse);
  renderAt('/dashboard');
  expect(await screen.findByText('Olá, Ana')).toBeTruthy();
  for (const name of [/assinar documento/i, /verificar documento/i, /dispositivos/i, /sessões ativas/i]) expect(screen.getByRole('link', { name })).toBeTruthy();
});

test('explains an expired session on the login page after a refresh is rejected', async () => {
  vi.spyOn(authService, 'me').mockResolvedValue({ data: { id: '1', name: 'Ana', email: 'a@example.com' } } as AxiosResponse);
  render(<SessionProvider><MemoryRouter initialEntries={['/dashboard']}><Routes><Route path="/login" element={<LoginForm />} /><Route element={<RequireAuth />}><Route path="/dashboard" element={<DashboardPage />} /></Route></Routes></MemoryRouter></SessionProvider>);
  await screen.findByText('Olá, Ana');
  // Any protected call now gets 401 and the refresh is rejected too.
  const original = api.defaults.adapter;
  api.defaults.adapter = (async (config: InternalAxiosRequestConfig) => { throw new AxiosError('fail', undefined, config, undefined, { status: 401, data: {}, statusText: '', headers: {}, config } as AxiosResponse); }) as AxiosAdapter;
  await api.get('/documents').catch(() => undefined);
  api.defaults.adapter = original;
  expect(await screen.findByText(/sua sessão expirou/i)).toBeTruthy();
});

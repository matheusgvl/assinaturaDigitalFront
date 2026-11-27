import { render, screen, waitFor } from '@testing-library/react';
import axe from 'axe-core';
import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { beforeEach, expect, test, vi } from 'vitest';
import { routes } from './router';
import { SessionProvider } from './session';
import { authService } from '../services/auth.service';
import { securityService } from '../services/security.service';
import { accountService } from '../services/account.service';

const ok = <T,>(data: T) => ({ data } as AxiosResponse<T>);
const unauthorized = new AxiosError('401', undefined, undefined, undefined, { status: 401, data: {}, statusText: '', headers: {}, config: { headers: new AxiosHeaders() } } as AxiosResponse);
const user = { id: '1', name: 'Ana', email: 'ana@example.com', totpEnabled: true };

function mountAt(path: string, signedIn: boolean, state?: unknown) {
  if (signedIn) vi.spyOn(authService, 'me').mockResolvedValue(ok(user));
  else vi.spyOn(authService, 'me').mockRejectedValue(unauthorized);
  const router = createMemoryRouter(routes, { initialEntries: [{ pathname: path, state }] });
  return { router, ...render(<SessionProvider><RouterProvider router={router} /></SessionProvider>) };
}

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(securityService, 'listPasskeys').mockResolvedValue(ok([{ id: 'p1', name: 'Notebook', createdAt: '2026-11-20T10:00:00Z' }]));
  vi.spyOn(securityService, 'listSessions').mockResolvedValue(ok([{ id: 's1', current: true, device: 'Chrome em Linux', createdAt: '2026-11-26T10:00:00Z' }]));
  vi.spyOn(accountService, 'listAlerts').mockResolvedValue(ok([{ id: 'a1', type: 'new_ip', createdAt: '2026-11-26T10:00:00Z', ip: '10.0.0.1', read: false }]));
});

test.each(['/dashboard', '/sign', '/passkeys', '/security', '/security/sessions', '/security/totp'])('private route %s redirects visitors to login', async path => {
  const { router } = mountAt(path, false);
  await waitFor(() => expect(router.state.location.pathname).toBe('/login'));
  expect(router.state.location.state).toEqual({ from: path });
});

test.each(['/', '/login', '/register', '/verify'])('public route %s opens without a session', async path => {
  const { router } = mountAt(path, false);
  await screen.findAllByRole('heading', { level: 1 });
  expect(router.state.location.pathname).toBe(path);
});

test('unknown routes show the 404 page', async () => {
  mountAt('/nao-existe', false);
  expect(await screen.findByText(/página não encontrada/i)).toBeTruthy();
});

// Automated WCAG checks (axe-core). Color contrast needs real layout, so it is checked in the browser instead.
const pages: Array<[string, boolean, string, unknown?]> = [
  ['/', false, 'Documentos confiáveis'],
  ['/login', false, 'Entrar na plataforma'],
  ['/register', false, 'Criar sua conta'],
  ['/verify', false, 'Verificar documento'],
  ['/login/totp', false, 'Confirme sua identidade', { transactionId: 'tx' }],
  ['/dashboard', true, 'Olá, Ana'],
  ['/sign', true, 'Assinar documento'],
  ['/passkeys', true, 'Notebook'],
  ['/security/sessions', true, 'Chrome em Linux'],
  ['/security', true, 'Acesso de um novo endereço IP'],
  ['/nao-existe', false, 'Página não encontrada'],
];

test.each(pages)('page %s has no detectable accessibility violations', async (path, signedIn, ready, state) => {
  const { container } = mountAt(path, signedIn, state);
  await screen.findAllByText(new RegExp(ready, 'i'));
  const result = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });
  expect(result.violations.map(v => `${v.id}: ${v.nodes.map(n => n.target.join(' ')).join(', ')}`)).toEqual([]);
});

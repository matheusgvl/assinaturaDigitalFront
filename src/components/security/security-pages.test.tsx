import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { AxiosResponse } from 'axios';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, expect, test, vi } from 'vitest';
import { SessionProvider } from '../../app/session';
import { authService } from '../../services/auth.service';
import { securityService } from '../../services/security.service';
import { DevicesPage, SessionsPage } from '../../pages/SecurityPages';
import type { ActiveSession, PasskeyDevice } from '../../types/security';

const ok = <T,>(data: T) => ({ data } as AxiosResponse<T>);
const devices: PasskeyDevice[] = [{ id: 'pk/1', name: 'Notebook', createdAt: '2026-11-20T10:00:00Z' }, { id: 'pk2', name: 'Celular', createdAt: '2026-11-21T10:00:00Z' }];
const sessions: ActiveSession[] = [
  { id: 's1', current: true, device: 'Chrome em Linux', ip: '10.0.0.1', createdAt: '2026-11-26T10:00:00Z' },
  { id: 's2', current: false, device: 'Firefox em Windows', ip: '10.0.0.2', createdAt: '2026-11-25T10:00:00Z' },
];
const renderPage = (page: React.ReactNode) => render(<SessionProvider><MemoryRouter initialEntries={['/page']}><Routes><Route path="/page" element={page} /><Route path="/login" element={<p>Tela de login</p>} /></Routes></MemoryRouter></SessionProvider>);
const row = (name: string) => screen.getByText(name).closest('li') as HTMLElement;

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(authService, 'me').mockResolvedValue(ok({ id: '1', name: 'Ana', email: 'a@example.com' }));
});

test('lists passkeys and revokes only after confirmation', async () => {
  vi.spyOn(securityService, 'listPasskeys').mockResolvedValueOnce(ok(devices)).mockResolvedValue(ok([devices[1]]));
  const revoke = vi.spyOn(securityService, 'revokePasskey').mockResolvedValue(ok(undefined));
  renderPage(<DevicesPage />);
  await screen.findByText('Notebook');
  fireEvent.click(within(row('Notebook')).getByRole('button', { name: 'Revogar' }));
  expect(screen.getByText('Revogar a passkey "Notebook"?')).toBeTruthy();
  fireEvent.click(within(row('Notebook')).getByRole('button', { name: 'Cancelar' }));
  expect(revoke).not.toHaveBeenCalled();
  fireEvent.click(within(row('Notebook')).getByRole('button', { name: 'Revogar' }));
  fireEvent.change(within(row('Notebook')).getByLabelText('Confirme sua senha'), { target: { value: 'test-password' } });
  fireEvent.click(within(row('Notebook')).getAllByRole('button', { name: 'Revogar' })[0]);
  await waitFor(() => expect(revoke).toHaveBeenCalledWith('pk/1', 'test-password'));
  await waitFor(() => expect(screen.queryByText('Notebook')).toBeNull());
});

test('shows empty and retryable error states', async () => {
  const list = vi.spyOn(securityService, 'listPasskeys').mockRejectedValueOnce(new Error('down')).mockResolvedValue(ok([]));
  renderPage(<DevicesPage />);
  fireEvent.click(await screen.findByRole('button', { name: /tentar novamente/i }));
  expect(await screen.findByText('Nenhuma passkey registrada')).toBeTruthy();
  expect(list).toHaveBeenCalledTimes(2);
});

test('marks the current session and lets the user end another one after confirming', async () => {
  vi.spyOn(securityService, 'listSessions').mockResolvedValueOnce(ok(sessions)).mockResolvedValue(ok([sessions[0]]));
  const revoke = vi.spyOn(securityService, 'revokeSession').mockResolvedValue(ok(undefined));
  renderPage(<SessionsPage />);
  await screen.findByText('Chrome em Linux');
  expect(within(row('Chrome em Linux')).getByText('Esta sessão')).toBeTruthy();
  expect(within(row('Chrome em Linux')).queryByRole('button', { name: 'Encerrar' })).toBeNull();
  fireEvent.click(within(row('Firefox em Windows')).getByRole('button', { name: 'Encerrar' }));
  fireEvent.click(within(row('Firefox em Windows')).getByRole('button', { name: 'Encerrar' }));
  await waitFor(() => expect(revoke).toHaveBeenCalledWith('s2'));
  await waitFor(() => expect(screen.queryByText('Firefox em Windows')).toBeNull());
});

test('signing out everywhere revokes all sessions, ends the local one and returns to login', async () => {
  vi.spyOn(securityService, 'listSessions').mockResolvedValue(ok(sessions));
  const revokeAll = vi.spyOn(securityService, 'revokeAllSessions').mockResolvedValue(ok(undefined));
  const logout = vi.spyOn(authService, 'logout').mockResolvedValue(ok(undefined));
  renderPage(<SessionsPage />);
  fireEvent.click(await screen.findByRole('button', { name: 'Sair de todos os dispositivos' }));
  expect(revokeAll).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Sair de todos' }));
  expect(await screen.findByText('Tela de login')).toBeTruthy();
  expect(revokeAll).toHaveBeenCalled();
  expect(logout).toHaveBeenCalled();
});

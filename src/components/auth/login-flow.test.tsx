import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { AxiosResponse } from 'axios';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, expect, test, vi } from 'vitest';
import { SessionProvider } from '../../app/session';
import { authService } from '../../services/auth.service';
import { totpService } from '../../services/totp.service';
import { getAccessToken, setAccessToken } from '../../services/api';
import { Header } from '../layout/Header';
import { LoginForm } from './LoginForm';
import { TotpChallenge } from './TotpChallenge';
import { TotpSetup } from './TotpSetup';
import type { TotpVerificationResponse } from '../../types/totp';

const user = { id: '1', name: 'Ana', email: 'ana@example.com' };
function Where() { const location = useLocation(); return <p>Rota: {location.pathname} {JSON.stringify(location.state)}</p>; }
const renderAt = (path: string, state?: unknown) => render(
  <SessionProvider><MemoryRouter initialEntries={[{ pathname: path, state }]}><Routes>
    <Route path="/login" element={<><LoginForm /><Where /></>} />
    <Route path="/login/totp" element={<><TotpChallenge /><Where /></>} />
    <Route path="/dashboard" element={<><Header /><Where /></>} />
  </Routes></MemoryRouter></SessionProvider>,
);
const fillLogin = () => {
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'ana@example.com' } });
  fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'not-a-real-secret' } });
  fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
};

beforeEach(() => { vi.restoreAllMocks(); setAccessToken(null); });

test('password login stores the token in memory and goes to the dashboard', async () => {
  const me = vi.spyOn(authService, 'me').mockRejectedValueOnce(new Error('none')).mockResolvedValue({ data: user } as AxiosResponse);
  vi.spyOn(authService, 'login').mockResolvedValue({ accessToken: 'jwt-1' });
  renderAt('/login');
  fillLogin();
  expect(await screen.findByText(/Rota: \/dashboard/)).toBeTruthy();
  expect(getAccessToken()).toBe('jwt-1');
  expect(me).toHaveBeenCalledTimes(2);
});

test('second factor sends the user to the TOTP step with the transaction id and no token', async () => {
  vi.spyOn(authService, 'me').mockRejectedValue(new Error('none'));
  vi.spyOn(authService, 'login').mockResolvedValue({ requiresSecondFactor: true, transactionId: 'tx-9' });
  renderAt('/login');
  fillLogin();
  expect(await screen.findByText(/Rota: \/login\/totp .*tx-9/)).toBeTruthy();
  expect(getAccessToken()).toBeNull();
});

test('TOTP step submits the real transaction id and signs in', async () => {
  vi.spyOn(authService, 'me').mockRejectedValueOnce(new Error('none')).mockResolvedValue({ data: user } as AxiosResponse);
  const verify = vi.spyOn(totpService, 'verifyLogin').mockResolvedValue({ data: { accessToken: 'jwt-2' } } as AxiosResponse<TotpVerificationResponse>);
  renderAt('/login/totp', { transactionId: 'tx-9', from: '/dashboard' });
  fireEvent.change(screen.getByLabelText('Código TOTP'), { target: { value: '123456' } });
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar código' }));
  expect(await screen.findByText(/Rota: \/dashboard/)).toBeTruthy();
  expect(verify).toHaveBeenCalledWith({ transactionId: 'tx-9', code: '123456', recoveryCode: undefined });
  expect(getAccessToken()).toBe('jwt-2');
});

test('TOTP step without a login in progress points back to the login', async () => {
  vi.spyOn(authService, 'me').mockRejectedValue(new Error('none'));
  renderAt('/login/totp');
  expect(await screen.findByText(/nenhum login em andamento/i)).toBeTruthy();
  expect(screen.getByRole('link', { name: /ir para o login/i })).toBeTruthy();
});

test('logout invalidates on the server, clears the token and returns to login', async () => {
  vi.spyOn(authService, 'me').mockResolvedValue({ data: user } as AxiosResponse);
  const logout = vi.spyOn(authService, 'logout').mockResolvedValue({} as AxiosResponse);
  setAccessToken('jwt-3');
  renderAt('/dashboard');
  fireEvent.click(await screen.findByRole('button', { name: 'Sair' }));
  expect(await screen.findByText(/Rota: \/login/)).toBeTruthy();
  expect(logout).toHaveBeenCalled();
  expect(getAccessToken()).toBeNull();
});

test('shows recovery codes returned when TOTP is activated', async () => {
  vi.spyOn(authService, 'me').mockRejectedValue(new Error('none'));
  vi.spyOn(totpService, 'startSetup').mockResolvedValue({ data: { setupId: 's1', qrCodeDataUrl: 'data:image/png;base64,AA==' } } as AxiosResponse);
  vi.spyOn(totpService, 'confirmSetup').mockResolvedValue({ data: { codes: ['AAAA-1111', 'BBBB-2222'] } } as AxiosResponse);
  render(<SessionProvider><MemoryRouter><TotpSetup /></MemoryRouter></SessionProvider>);
  fireEvent.click(screen.getByRole('button', { name: /começar configuração/i }));
  fireEvent.change(await screen.findByLabelText(/código de seis dígitos/i), { target: { value: '654321' } });
  fireEvent.click(screen.getByRole('button', { name: /confirmar ativação/i }));
  expect(await screen.findByText('AAAA-1111')).toBeTruthy();
  await waitFor(() => expect(screen.getByText('BBBB-2222')).toBeTruthy());
});

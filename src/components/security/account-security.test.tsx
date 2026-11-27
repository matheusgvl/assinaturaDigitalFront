import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, test, vi } from 'vitest';
import { SessionProvider } from '../../app/session';
import { authService } from '../../services/auth.service';
import { accountService } from '../../services/account.service';
import { AccountSecurityPage } from '../../pages/SecurityPages';
import type { SecurityAlert } from '../../types/security';

const ok = <T,>(data: T) => ({ data } as AxiosResponse<T>);
const alerts: SecurityAlert[] = [
  { id: 'a1', type: 'new_ip', createdAt: '2026-11-26T10:00:00Z', ip: '189.44.12.7', device: 'Firefox em Windows', read: false },
  { id: 'a2', type: 'password_changed', createdAt: '2026-11-25T10:00:00Z', read: true },
  { id: 'a3', type: 'session_hijack_suspected', createdAt: '2026-11-24T10:00:00Z', read: false },
];
const renderPage = (totpEnabled = true) => {
  vi.spyOn(authService, 'me').mockResolvedValue(ok({ id: '1', name: 'Ana', email: 'a@example.com', totpEnabled }));
  return render(<SessionProvider><MemoryRouter><AccountSecurityPage /></MemoryRouter></SessionProvider>);
};
const section = (heading: RegExp) => screen.getByRole('heading', { name: heading }).closest('.account-section') as HTMLElement;

beforeEach(() => { vi.restoreAllMocks(); vi.spyOn(accountService, 'listAlerts').mockResolvedValue(ok(alerts)); });

test('highlights unread alerts and marks them as read', async () => {
  const mark = vi.spyOn(accountService, 'markAlertsRead').mockResolvedValue(ok(undefined));
  renderPage();
  expect(await screen.findByText('Acesso de um novo endereço IP')).toBeTruthy();
  expect(screen.getByText('2 novos')).toBeTruthy();
  expect(screen.getByText('Acesso de um novo endereço IP').closest('li')?.className).toContain('alert-unread');
  expect(screen.getByText('Senha alterada').closest('li')?.className).not.toContain('alert-unread');
  // Unknown backend events are still shown faithfully instead of being hidden.
  expect(screen.getByText('Evento de segurança (session_hijack_suspected)')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Marcar como lidos' }));
  await waitFor(() => expect(mark).toHaveBeenCalledWith(['a1', 'a3']));
});

test('renders only whitelisted alert fields, never extra payload', async () => {
  vi.spyOn(accountService, 'listAlerts').mockResolvedValue(ok([{ ...alerts[0], token: 'secret-token-123' } as SecurityAlert]));
  renderPage();
  await screen.findByText('Acesso de um novo endereço IP');
  expect(document.body.textContent).not.toContain('secret-token-123');
});

test('changes the password with policy checks and clears the fields', async () => {
  const change = vi.spyOn(accountService, 'changePassword').mockResolvedValue(ok(undefined));
  renderPage();
  const form = section(/^senha$/i);
  const submit = within(form).getByRole('button', { name: 'Alterar senha' }) as HTMLButtonElement;
  fireEvent.change(within(form).getByLabelText('Senha atual'), { target: { value: 'Old-password-1!' } });
  fireEvent.change(within(form).getByLabelText('Nova senha'), { target: { value: 'Old-password-1!' } });
  fireEvent.change(within(form).getByLabelText('Confirmar nova senha'), { target: { value: 'Old-password-1!' } });
  expect(within(form).getByText(/diferente da atual/i)).toBeTruthy();
  expect(submit.disabled).toBe(true);
  fireEvent.change(within(form).getByLabelText('Nova senha'), { target: { value: 'New-password-2!' } });
  fireEvent.change(within(form).getByLabelText('Confirmar nova senha'), { target: { value: 'New-password-2!' } });
  fireEvent.click(submit);
  await waitFor(() => expect(change).toHaveBeenCalledWith({ currentPassword: 'Old-password-1!', newPassword: 'New-password-2!' }));
  expect(await within(form).findByText(/senha alterada/i)).toBeTruthy();
  expect((within(form).getByLabelText('Senha atual') as HTMLInputElement).value).toBe('');
});

test('reports a wrong current password without details', async () => {
  vi.spyOn(accountService, 'changePassword').mockRejectedValue(new AxiosError('bad', undefined, undefined, undefined, { status: 401, data: { message: 'hash mismatch' }, statusText: '', headers: {}, config: { headers: new AxiosHeaders() } } as AxiosResponse));
  renderPage();
  const form = section(/^senha$/i);
  fireEvent.change(within(form).getByLabelText('Senha atual'), { target: { value: 'Wrong-password-1!' } });
  fireEvent.change(within(form).getByLabelText('Nova senha'), { target: { value: 'New-password-2!' } });
  fireEvent.change(within(form).getByLabelText('Confirmar nova senha'), { target: { value: 'New-password-2!' } });
  fireEvent.click(within(form).getByRole('button', { name: 'Alterar senha' }));
  expect(await within(form).findByText(/confira a senha atual/i)).toBeTruthy();
  expect(document.body.textContent).not.toContain('hash mismatch');
});

test('disabling TOTP requires a current code', async () => {
  const disable = vi.spyOn(accountService, 'disableTotp').mockResolvedValue(ok(undefined));
  renderPage(true);
  const box = await waitFor(() => section(/verificação em duas etapas/i));
  expect(await within(box).findByText('Ativa')).toBeTruthy();
  fireEvent.click(within(box).getByRole('button', { name: 'Desativar' }));
  const confirm = within(box).getByRole('button', { name: 'Confirmar desativação' }) as HTMLButtonElement;
  expect(confirm.disabled).toBe(true);
  fireEvent.change(within(box).getByLabelText('Código do aplicativo'), { target: { value: '123456' } });
  fireEvent.click(confirm);
  await waitFor(() => expect(disable).toHaveBeenCalledWith({ code: '123456' }));
});

test('offers activation when TOTP is inactive', async () => {
  renderPage(false);
  expect(await screen.findByRole('link', { name: /ativar verificação em duas etapas/i })).toBeTruthy();
});

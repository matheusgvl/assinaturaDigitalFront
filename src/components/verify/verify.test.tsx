import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, test, vi } from 'vitest';
import { VerifyDocumentPage } from '../../pages/VerifyDocumentPage';
import { verificationService } from '../../services/verification.service';
import type { VerificationResponse } from '../../types/verification';

const respond = (data: Partial<VerificationResponse>) => vi.spyOn(verificationService, 'verify').mockResolvedValue({ data } as AxiosResponse<VerificationResponse>);
const pdf = () => new File(['%PDF-1.7\n'], 'contrato-assinado.pdf', { type: 'application/pdf' });
const input = () => screen.getByLabelText('Documento PDF') as HTMLInputElement;

async function verifyFile() {
  fireEvent.change(input(), { target: { files: [pdf()] } });
  const button = screen.getByRole('button', { name: 'Verificar documento' });
  await waitFor(() => expect((button as HTMLButtonElement).disabled).toBe(false));
  fireEvent.click(button);
}

beforeEach(() => { vi.restoreAllMocks(); render(<MemoryRouter><VerifyDocumentPage /></MemoryRouter>); });

test('shows an intact document with signature details', async () => {
  respond({ status: 'valid', signer: 'Ana', signedAt: '2026-11-26T15:04:05Z', signatureId: 'sig-123', documentHash: 'ab'.repeat(32) });
  await verifyFile();
  expect(await screen.findByText('Documento íntegro.')).toBeTruthy();
  expect(screen.getByText('2026-11-26 15:04:05 UTC')).toBeTruthy();
  expect(screen.getByText('sig-123')).toBeTruthy();
});

test('shows a tampered document', async () => {
  respond({ status: 'tampered' });
  await verifyFile();
  expect(await screen.findByText('Documento adulterado.')).toBeTruthy();
});

test('shows signature not found and warns that a visual seal is not proof', async () => {
  respond({ status: 'not_found' });
  await verifyFile();
  expect(await screen.findByText('Assinatura não encontrada.')).toBeTruthy();
  expect(screen.getByText(/selo visual.*não comprova/i)).toBeTruthy();
});

test('never presents an unknown server answer as valid', async () => {
  respond({ status: 'ok' as never });
  await verifyFile();
  expect(await screen.findByText(/resposta inesperada/i)).toBeTruthy();
  expect(screen.queryByText('Documento íntegro.')).toBeNull();
});

test('shows rate limit feedback with Retry-After', async () => {
  vi.spyOn(verificationService, 'verify').mockRejectedValue(new AxiosError('limit', undefined, undefined, undefined, { status: 429, data: {}, statusText: '', headers: { 'retry-after': '30' }, config: { headers: new AxiosHeaders() } } as AxiosResponse));
  await verifyFile();
  expect(await screen.findByText(/aguarde 30 segundos/i)).toBeTruthy();
});

test('clears the selected file after verification and keeps nothing in storage', async () => {
  respond({ status: 'valid' });
  await verifyFile();
  await screen.findByText('Documento íntegro.');
  expect(input().files?.length ?? 0).toBe(0);
  expect((screen.getByRole('button', { name: 'Verificar documento' }) as HTMLButtonElement).disabled).toBe(true);
  expect(localStorage.length + sessionStorage.length).toBe(0);
});

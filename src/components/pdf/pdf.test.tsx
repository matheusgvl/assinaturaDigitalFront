import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { AxiosResponse } from 'axios';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, test, vi } from 'vitest';
import { SignDocumentPage } from '../../pages/SignDocumentPage';
import { signatureService } from '../../services/signature.service';
import type { SealPosition } from '../../utils/seal-position';

// pdf.js needs a real canvas and worker; jsdom has neither, so the preview is stubbed with a "place seal" action.
vi.mock('./PdfPreview', () => ({ PdfPreview: ({ file, onPlace }: { file: File; onPlace: (seal: SealPosition) => void }) => <div><p>Prévia de {file.name}</p><button onClick={() => onPlace({ page: 2, x: 100, y: 150 })}>Posicionar selo</button></div> }));
vi.mock('../../app/session', () => ({ useSession: () => ({ user: { id: '1', name: 'Ana', email: 'ana@example.com' } }) }));

const validPdf = () => new File(['%PDF-1.7\n'], 'contrato.pdf', { type: 'application/pdf' });
const choose = (file: File) => fireEvent.change(screen.getByLabelText('Documento PDF'), { target: { files: [file] } });

beforeEach(() => { vi.restoreAllMocks(); render(<MemoryRouter><SignDocumentPage /></MemoryRouter>); });

test('previews a valid PDF with seal data', async () => {
  choose(validPdf());
  expect(await screen.findByText('Prévia de contrato.pdf')).toBeTruthy();
  expect(screen.getByText('Ana')).toBeTruthy();
  expect(await screen.findByText(/^[0-9a-f]{64}$/)).toBeTruthy();
});

test('rejects an invalid file with feedback and no preview', async () => {
  choose(new File(['GIF89a'], 'falso.pdf', { type: 'application/pdf' }));
  expect(await screen.findByRole('alert')).toBeTruthy();
  await waitFor(() => expect(screen.queryByText(/prévia de/i)).toBeNull());
});

test('does not persist the file in browser storage', async () => {
  choose(validPdf());
  await screen.findByText('Prévia de contrato.pdf');
  expect(localStorage.length + sessionStorage.length).toBe(0);
});

test('sends file, page and coordinates only after the seal is placed', async () => {
  const sign = vi.spyOn(signatureService, 'sign').mockResolvedValue({ data: new Blob() } as AxiosResponse<Blob>);
  const file = validPdf();
  choose(file);
  const submit = await screen.findByRole('button', { name: 'Assinar documento' });
  expect((submit as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Posicionar selo' }));
  expect(screen.getByText('Página 2, X 100 pt, Y 150 pt')).toBeTruthy();
  fireEvent.click(submit);
  await waitFor(() => expect(sign).toHaveBeenCalledWith(file, { page: 2, x: 100, y: 150 }));
});

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, test, vi } from 'vitest';
import { SignDocumentPage } from '../../pages/Pages';

// pdf.js needs a real canvas and worker; jsdom has neither, so the preview is stubbed.
vi.mock('./PdfPreview', () => ({ PdfPreview: ({ file }: { file: File }) => <p>Prévia de {file.name}</p> }));
vi.mock('../../app/session', () => ({ useSession: () => ({ user: null }) }));

const choose = (file: File) => fireEvent.change(screen.getByLabelText('Documento PDF'), { target: { files: [file] } });

beforeEach(() => { render(<MemoryRouter><SignDocumentPage /></MemoryRouter>); });

test('previews a valid PDF', async () => {
  choose(new File(['%PDF-1.7\n'], 'contrato.pdf', { type: 'application/pdf' }));
  expect(await screen.findByText('Prévia de contrato.pdf')).toBeTruthy();
});

test('rejects an invalid file with feedback and no preview', async () => {
  choose(new File(['GIF89a'], 'falso.pdf', { type: 'application/pdf' }));
  expect(await screen.findByRole('alert')).toBeTruthy();
  await waitFor(() => expect(screen.queryByText(/prévia de/i)).toBeNull());
});

test('does not persist the file in browser storage', async () => {
  choose(new File(['%PDF-1.7\n'], 'contrato.pdf', { type: 'application/pdf' }));
  await screen.findByText('Prévia de contrato.pdf');
  expect(localStorage.length + sessionStorage.length).toBe(0);
});

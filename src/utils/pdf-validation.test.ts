import { expect, test } from 'vitest';
import { MAX_PDF_BYTES, validatePdf } from './pdf-validation';

const pdf = (content: BlobPart, name = 'doc.pdf', type = 'application/pdf') => new File([content], name, { type });

test('accepts a file with the PDF magic number', async () => { expect(await validatePdf(pdf('%PDF-1.7\n...'))).toBeNull(); });
test('rejects a fake PDF with the right extension', async () => { expect(await validatePdf(pdf('MZ not a pdf'))).toMatch(/não corresponde/); });
test('rejects other formats', async () => { expect(await validatePdf(pdf('%PDF-1.7', 'foto.png', 'image/png'))).toMatch(/formato PDF/); });
test('rejects empty files', async () => { expect(await validatePdf(pdf(''))).toMatch(/vazio/); });
test('rejects files above the size limit', async () => {
  const file = pdf('%PDF-');
  Object.defineProperty(file, 'size', { value: MAX_PDF_BYTES + 1 });
  expect(await validatePdf(file)).toMatch(/20 MB/);
});

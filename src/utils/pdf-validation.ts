// Mirrors the backend limit (REQ-61); the server remains the authority.
export const MAX_PDF_BYTES = 20 * 1024 * 1024;

// Fast client-side feedback only; magic number, size and /JS checks are enforced again by the API.
export async function validatePdf(file: File): Promise<string | null> {
  if (file.size === 0) return 'O arquivo está vazio.';
  if (file.size > MAX_PDF_BYTES) return 'O arquivo excede o limite de 20 MB.';
  if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') return 'Selecione um arquivo no formato PDF.';
  const header = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  if (String.fromCharCode(...header) !== '%PDF-') return 'O conteúdo do arquivo não corresponde a um PDF válido.';
  return null;
}

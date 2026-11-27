// Espelha o limite do backend (REQ-61); o servidor continua sendo a autoridade.
export const MAX_PDF_BYTES = 20 * 1024 * 1024;

/** Feedback rapido no cliente; a API repete magic number, tamanho e bloqueio de JavaScript. */
export async function validatePdf(file: File): Promise<string | null> {
  if (file.size === 0) return 'O arquivo está vazio.';
  if (file.size > MAX_PDF_BYTES) return 'O arquivo excede o limite de 20 MB.';
  if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') return 'Selecione um arquivo no formato PDF.';
  if (!(await isPdfBlob(file))) return 'O conteúdo do arquivo não corresponde a um PDF válido.';
  return null;
}

export async function isPdfBlob(blob: Blob): Promise<boolean> {
  const header = new Uint8Array(await blob.slice(0, 5).arrayBuffer());
  return String.fromCharCode(...header) === '%PDF-';
}

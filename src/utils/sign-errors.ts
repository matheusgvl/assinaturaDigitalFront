import axios from 'axios';

const statusOf = (error: unknown) => (axios.isAxiosError(error) ? error.response?.status : undefined);
const isNetworkError = (error: unknown) => axios.isAxiosError(error) && !error.response;

function tooManyRequests(error: unknown) {
  const retryAfter = axios.isAxiosError(error) ? Number(error.response?.headers?.['retry-after']) : NaN;
  return `Muitas tentativas em sequência. Aguarde${retryAfter > 0 ? ` ${retryAfter} segundos` : ' um pouco'} e tente novamente.`;
}

// Maps HTTP failures to user feedback without exposing backend details.
export function signErrorMessage(error: unknown): string {
  const status = statusOf(error);
  if (status === 401 || status === 403) return 'Sua sessão expirou. Entre novamente para assinar.';
  if (status === 413) return 'O arquivo excede o limite aceito pelo servidor.';
  if (status === 400 || status === 415 || status === 422) return 'O servidor recusou este PDF. Verifique se o arquivo é válido e não contém conteúdo ativo.';
  if (status === 429) return tooManyRequests(error);
  if (isNetworkError(error)) return 'Não foi possível contatar o servidor. Verifique sua conexão.';
  return 'Não foi possível assinar o documento. Tente novamente.';
}

export function verifyErrorMessage(error: unknown): string {
  const status = statusOf(error);
  if (status === 413) return 'O arquivo excede o limite aceito pelo servidor.';
  if (status === 400 || status === 415 || status === 422) return 'O servidor não conseguiu processar este PDF. Verifique se o arquivo é válido.';
  if (status === 429) return tooManyRequests(error);
  if (isNetworkError(error)) return 'Não foi possível contatar o servidor. Verifique sua conexão.';
  return 'Não foi possível verificar o documento. Tente novamente.';
}

export const signedFileName = (original: string) => `${original.replace(/\.pdf$/i, '')}-assinado.pdf`;

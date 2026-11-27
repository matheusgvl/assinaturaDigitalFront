import axios from 'axios';

// Maps HTTP failures to user feedback without exposing backend details.
export function signErrorMessage(error: unknown): string {
  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  if (status === 401 || status === 403) return 'Sua sessão expirou. Entre novamente para assinar.';
  if (status === 413) return 'O arquivo excede o limite aceito pelo servidor.';
  if (status === 400 || status === 415 || status === 422) return 'O servidor recusou este PDF. Verifique se o arquivo é válido e não contém conteúdo ativo.';
  if (status === 429) return 'Muitas tentativas em sequência. Aguarde um pouco e tente novamente.';
  if (axios.isAxiosError(error) && !error.response) return 'Não foi possível contatar o servidor. Verifique sua conexão.';
  return 'Não foi possível assinar o documento. Tente novamente.';
}

export const signedFileName = (original: string) => `${original.replace(/\.pdf$/i, '')}-assinado.pdf`;

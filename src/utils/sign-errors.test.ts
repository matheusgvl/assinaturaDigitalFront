import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios';
import { expect, test } from 'vitest';
import { signErrorMessage, signedFileName } from './sign-errors';

const httpError = (status: number) => new AxiosError('fail', undefined, undefined, undefined, { status, data: {}, statusText: '', headers: {}, config: { headers: new AxiosHeaders() } } as AxiosResponse);

test('maps HTTP failures to safe messages', () => {
  expect(signErrorMessage(httpError(401))).toMatch(/sessão expirou/);
  expect(signErrorMessage(httpError(413))).toMatch(/limite/);
  expect(signErrorMessage(httpError(422))).toMatch(/recusou/);
  expect(signErrorMessage(httpError(429))).toMatch(/muitas tentativas/i);
  expect(signErrorMessage(new AxiosError('network'))).toMatch(/conexão/);
  expect(signErrorMessage(httpError(500))).toMatch(/tente novamente/i);
});

test('names the signed file after the original', () => {
  expect(signedFileName('Contrato.PDF')).toBe('Contrato-assinado.pdf');
});

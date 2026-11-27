import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { SignResult } from './SignResult';

afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });

test('downloads exactly the blob returned by the server and frees the temporary URL', () => {
  vi.useFakeTimers();
  const create = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:signed');
  const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    expect(this.href).toBe('blob:signed');
    expect(this.download).toBe('contrato-assinado.pdf');
  });
  const signed = new Blob(['%PDF-1.7 signed'], { type: 'application/pdf' });
  render(<SignResult signed={signed} fileName="contrato-assinado.pdf" onReset={() => undefined} />);
  fireEvent.click(screen.getByRole('button', { name: /baixar pdf assinado/i }));
  expect(create).toHaveBeenCalledWith(signed);
  expect(click).toHaveBeenCalled();
  vi.runAllTimers();
  expect(revoke).toHaveBeenCalledWith('blob:signed');
});

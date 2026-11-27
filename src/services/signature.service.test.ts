import { expect, test, vi } from 'vitest';
import { api } from './api';
import { signatureService } from './signature.service';

test('posts the file and seal position as multipart form data', async () => {
  const post = vi.spyOn(api, 'post').mockResolvedValue({ data: new Blob() });
  const file = new File(['%PDF-'], 'a.pdf', { type: 'application/pdf' });
  await signatureService.sign(file, { page: 3, x: 40, y: 60 });
  const [url, form, config] = post.mock.calls[0] as [string, FormData, { headers: Record<string, string>; responseType: string }];
  expect(url).toBe('/documents/sign');
  expect(form.get('file')).toBeInstanceOf(File);
  expect([form.get('page'), form.get('x'), form.get('y')]).toEqual(['3', '40', '60']);
  expect(config.headers['Content-Type']).toBe('multipart/form-data');
  expect(config.responseType).toBe('blob');
});

import { expect, test, vi } from 'vitest';
import { api } from './api';
import { verificationService } from './verification.service';

test('posts only the file as multipart to the public endpoint', async () => {
  const post = vi.spyOn(api, 'post').mockResolvedValue({ data: { status: 'valid' } });
  await verificationService.verify(new File(['%PDF-'], 'a.pdf', { type: 'application/pdf' }));
  const [url, form] = post.mock.calls[0] as [string, FormData];
  expect(url).toBe('/documents/verify');
  expect([...form.keys()]).toEqual(['file']);
});

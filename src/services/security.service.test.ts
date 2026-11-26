import { expect, test, vi } from 'vitest';
import { api } from './api';
import { securityService } from './security.service';

test('encodes ids in revocation paths', async () => {
  const del = vi.spyOn(api, 'delete').mockResolvedValue({ data: undefined });
  await securityService.revokePasskey('a/b?c');
  await securityService.revokeSession('s 1');
  expect(del.mock.calls.map(call => call[0])).toEqual(['/auth/passkeys/a%2Fb%3Fc', '/auth/sessions/s%201']);
});

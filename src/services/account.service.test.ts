import { expect, test, vi } from 'vitest';
import { api } from './api';
import { accountService } from './account.service';

test('sends account actions to the provisional endpoints', async () => {
  const post = vi.spyOn(api, 'post').mockResolvedValue({ data: undefined });
  await accountService.changePassword({ currentPassword: 'a', newPassword: 'b' });
  await accountService.disableTotp({ currentPassword: 'a', code: '123456' });
  await accountService.markAlertsRead(['x']);
  expect(post.mock.calls).toEqual([
    ['/auth/password', { currentPassword: 'a', newPassword: 'b' }],
    ['/auth/totp/disable', { currentPassword: 'a', code: '123456' }],
    ['/auth/alerts/read', { ids: ['x'] }],
  ]);
});

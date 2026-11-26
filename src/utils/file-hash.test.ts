import { expect, test } from 'vitest';
import { sha256Hex } from './file-hash';

test('computes the SHA-256 hex digest', async () => {
  expect(await sha256Hex(new Blob(['abc']))).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

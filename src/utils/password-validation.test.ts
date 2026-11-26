import { expect, test } from 'vitest'; import { validatePassword } from './password-validation';
test('enforces all password criteria', () => { const result = validatePassword('short', 'short'); expect(result.valid).toBe(false); expect(result.criteria.minLength).toBe(false); expect(result.criteria.uppercase).toBe(false); expect(result.criteria.number).toBe(false); expect(result.criteria.symbol).toBe(false); });
test('accepts a strong matching password', () => { const result = validatePassword('StrongPassword1!', 'StrongPassword1!'); expect(result.valid).toBe(true); expect(result.errors).toHaveLength(0); });
test('rejects a different confirmation', () => { expect(validatePassword('StrongPassword1!', 'OtherPassword1!').criteria.matchesConfirmation).toBe(false); });

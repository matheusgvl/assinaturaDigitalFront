export type PasswordCriteria = { minLength: boolean; uppercase: boolean; lowercase: boolean; number: boolean; symbol: boolean; matchesConfirmation: boolean };
export type PasswordValidation = { criteria: PasswordCriteria; valid: boolean; errors: string[] };

export function validatePassword(password: string, confirmation = password): PasswordValidation {
  const criteria: PasswordCriteria = { minLength: password.length >= 12, uppercase: /[A-Z]/.test(password), lowercase: /[a-z]/.test(password), number: /\d/.test(password), symbol: /[^A-Za-z0-9\s]/.test(password), matchesConfirmation: password === confirmation };
  const errors = [!criteria.minLength && 'A senha deve ter pelo menos 12 caracteres.', !criteria.uppercase && 'Inclua ao menos uma letra maiúscula.', !criteria.lowercase && 'Inclua ao menos uma letra minúscula.', !criteria.number && 'Inclua ao menos um número.', !criteria.symbol && 'Inclua ao menos um símbolo.', !criteria.matchesConfirmation && 'As senhas devem ser iguais.'].filter((error): error is string => Boolean(error));
  return { criteria, valid: errors.length === 0, errors };
}

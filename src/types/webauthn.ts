/** O identificador acompanha as opções até a resposta da mesma cerimônia. */
export type PasskeyCeremony<T> = { challengeId: string; options: T };

export type PasskeyLoginResult =
  | { confirmed: true; accessToken: string }
  | { confirmed: true; requiresSecondFactor: true; transactionId: string };

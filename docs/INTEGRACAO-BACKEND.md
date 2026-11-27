# Integração com o backend

O frontend usa `/api/v1` como base e envia cookies com `withCredentials`. O
fluxo de autenticação atualmente disponível no backend é:

- `POST /auth/register` com `{ name, email, password }`;
- `POST /auth/login` com `{ email, password }`, retornando `accessToken` e
  cookie HttpOnly de refresh;
- `GET /auth/me` com `Authorization: Bearer`;
- `POST /auth/refresh` para rotação do cookie;
- `POST /auth/logout` para revogação.

O frontend mantém o access token somente em memória. Cadastro aceito agora exibe
confirmação de sucesso; erros continuam sendo apresentados de forma genérica.

Os serviços de documentos, TOTP e passkeys permanecem preparados no cliente,
mas só devem ser apresentados como funcionais quando os endpoints correspondentes
estiverem disponíveis no backend.

# SignaPDF — frontend

Interface web do sistema acadêmico de assinatura digital de PDFs da disciplina de Segurança da Informação (UFRPE). Permite autenticar com senha, TOTP ou passkey, assinar um PDF posicionando o selo visual, baixar o documento assinado e verificar publicamente a autenticidade de um arquivo.

O frontend não executa criptografia de assinatura nem decide nada de segurança: ele conversa exclusivamente com a API REST do backend ([assinaturaDigital](https://github.com/matheusgvl/assinaturaDigital)), que é a autoridade sobre autenticação, sessões, assinatura e verificação.

## Funcionalidades

- Cadastro e login com senha, segundo fator TOTP e passkeys (WebAuthn)
- Sessão com access token apenas em memória, refresh por cookie HttpOnly, logout e aviso de sessão expirada
- Assinatura: upload validado, prévia paginada do PDF, posicionamento do selo por clique ou teclado e download do arquivo devolvido pela API
- Verificação pública, sem login, com os estados documento íntegro, documento adulterado e assinatura não encontrada
- Gestão de passkeys e sessões ativas, troca de senha, ativação/desativação do TOTP e alertas de segurança

## Início rápido

Pré-requisito: Node.js `^20.19.0` ou `>=22.12.0` (exigência do Vite 8).

```bash
npm ci
cp .env.example .env.local   # Windows: copy .env.example .env.local
npm run dev
```

A aplicação abre em `http://localhost:5173`. Em desenvolvimento, as chamadas para `/api` são repassadas pelo Vite ao backend definido em `API_PROXY_TARGET`. O backend deve estar configurado e com as migrations aplicadas antes de testar cadastro, login, assinatura ou verificação.

## Variáveis de ambiente

| Variável | Padrão | Uso |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `/api/v1` | Base das requisições no navegador. Mantenha relativa para que cookies e o cabeçalho CSRF funcionem (mesma origem). |
| `VITE_API_TIMEOUT_MS` | `10000` | Tempo limite das requisições, em milissegundos. |
| `API_PROXY_TARGET` | `http://localhost:3000` | Somente desenvolvimento: endereço do backend para o proxy do Vite. |

Variáveis `VITE_*` são públicas e entram no bundle: nunca coloque segredos nelas.

## Comandos

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento com proxy para a API |
| `npm run build` | Checagem de tipos e build de produção em `dist/` |
| `npm run preview` | Serve o build localmente |
| `npm run typecheck` | TypeScript em modo strict |
| `npm run lint` | ESLint |
| `npm run test` | Testes (Vitest + Testing Library + axe-core) |

Antes de abrir um PR, rode `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` e `npm audit --omit=dev`.

## Rotas

| Rota | Acesso | Tela |
| --- | --- | --- |
| `/` | Pública | Página inicial |
| `/login`, `/register` | Pública | Login (senha ou passkey) e cadastro |
| `/login/totp` | Pública, somente após a senha | Segundo fator TOTP ou código de recuperação |
| `/verify` | Pública | Verificação de autenticidade de um PDF |
| `/dashboard` | Autenticada | Painel com atalhos |
| `/sign` | Autenticada | Upload, prévia, selo e download do PDF assinado |
| `/security` | Autenticada | Senha, verificação em duas etapas e alertas |
| `/passkeys` | Autenticada | Registro e revogação de passkeys |
| `/security/sessions` | Autenticada | Sessões ativas, encerrar uma ou todas |
| `/security/totp`, `/security/recovery-codes` | Autenticada | Ativação do TOTP e códigos de recuperação |

Rotas autenticadas passam pelo guard `RequireAuth`, que é apenas visual: o backend deve rejeitar qualquer requisição sem sessão válida.

## Integração com o backend

Os caminhos e formatos de autenticação e documentos abaixo correspondem ao contrato publicado pelo backend. TOTP, passkeys e sessões avançadas ainda dependem das respectivas rotas do backend.

| Área | Endpoints |
| --- | --- |
| Conta e sessão | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me` |
| TOTP | `POST /auth/totp/setup`, `POST /auth/totp/setup/confirm`, `POST /auth/totp/login/verify`, `POST /auth/totp/disable` |
| Passkeys | `POST /auth/passkeys/registration/options`, `.../registration/verify`, `.../authentication/options`, `.../authentication/verify`, `GET /auth/passkeys`, `DELETE /auth/passkeys/:id` |
| Sessões | `GET /auth/sessions`, `DELETE /auth/sessions/:id`, `POST /auth/sessions/revoke-all` |
| Conta | `POST /auth/password`, `GET /auth/alerts`, `POST /auth/alerts/read` |
| Documentos | `POST /documents/sign` (multipart: `file`, `page`, `x`, `y`; resposta: PDF), `POST /documents/verify` (multipart: `file`) |

Convenções assumidas pelo frontend:

- Login responde `{ accessToken }` ou `{ requiresSecondFactor: true, transactionId }`; nenhum token antes do TOTP.
- O refresh token chega só por cookie HttpOnly; o access token vem no corpo e fica em memória.
- CSRF por Double Submit Cookie: o backend emite `csrf_token` com `SameSite=Strict`; o Axios copia esse cookie para `X-CSRF-Token` nas chamadas same-origin de refresh/logout.
- Selo: `x`/`y` são o canto inferior esquerdo em pontos PDF (origem no canto inferior esquerdo da página), caixa de 180 × 60 pt.
- Verificação responde `status` igual a `valid`, `tampered` ou `not_found`; qualquer outro valor é tratado como falha.

## Segurança no frontend

- Senhas, tokens, códigos de recuperação e PDFs nunca vão para `localStorage` ou `sessionStorage`.
- Mensagens de erro de login são genéricas; detalhes do servidor não são exibidos.
- PDFs são desenhados em canvas pelo pdf.js (scripts e formulários embutidos não executam); `pdfjs-dist` 6.x, sem a vulnerabilidade GHSA-hq66-cqwq-w95j da linha 5.x.
- O download de assinatura usa exclusivamente os bytes devolvidos pela API, e só se começarem com `%PDF-`.
- Revogações e desativação do TOTP exigem confirmação; desativar o TOTP pede um código atual.

Validação efetiva de senha, emissão e revogação de tokens, rate limiting, verificação de PDFs e criptografia permanecem no backend. O backend não persiste os bytes dos PDFs: executa o processamento em memória e guarda apenas metadados da assinatura.

## Estrutura

```
src/
  app/         roteador, sessão (SessionProvider, RequireAuth)
  pages/       telas
  components/  auth, pdf, verify, security, layout e componentes base
  services/    cliente HTTP (api.ts) e serviços por área
  hooks/       useApiList
  types/       contratos da API e dos recursos ainda em evolução
  utils/       validação de senha e PDF, coordenadas do selo, hash, mensagens de erro
  styles/      CSS por área
docs/
  REQUISITOS.md  checklist de requisitos e evidências
```

## Testes e acessibilidade

## Execucao local para demonstracao

Inicie primeiro o backend, aplique as migrations no banco de demonstracao
separado e depois execute o frontend:

```powershell
cd assinaturaDigitalFront
npm ci
Copy-Item .env.example .env.local -ErrorAction SilentlyContinue
npm run typecheck
npm run lint
npm run test
npm run build
npm run dev
```

O backend deve estar em `http://localhost:3000` e o frontend em
`http://localhost:5173`. Em `.env.local`, mantenha `VITE_API_BASE_URL=/api/v1`
e `API_PROXY_TARGET=http://localhost:3000`. Variaveis `VITE_*` sao publicas e
nunca podem conter chaves, senhas ou tokens.

O navegador mantem o access token somente em memoria. O refresh token e um
cookie HttpOnly/SameSite Strict emitido pelo backend e o `csrf_token` e copiado
para `X-CSRF-Token` somente nas operacoes de refresh e logout. O frontend nao
decodifica nem decide a validade de `jti`, `session_id`, `iat`, `ip_hash` ou
`ua_hash`; essa politica e aplicada pelo guard do backend. A troca de senha usa
`POST /api/v1/auth/password`, apos o qual as sessoes anteriores sao revogadas e
o usuario deve fazer login novamente.

O roteiro real de homologacao e: cadastro, login, upload de PDF, previa,
posicionamento do selo, assinatura, download, verificacao valida, verificacao
de arquivo adulterado e logout. O backend continua sendo a autoridade sobre
criptografia, rate limiting, sessoes, validacao de PDFs e persistencia de
metadados.

A suíte cobre navegação e guard de rotas, formulários, upload, posicionamento do selo, assinatura, verificação, sessão (refresh, expiração, logout), passkeys, sessões, alertas e uma auditoria automática WCAG com axe-core em todas as telas. O detalhamento por requisito e as evidências de validação estão em [docs/REQUISITOS.md](docs/REQUISITOS.md).

## Licença

[MIT](LICENSE)

# SignaPDF — frontend

Frontend inicial do sistema acadêmico de assinatura digital de PDFs da disciplina de Segurança da Informação (UFRPE). A aplicação estabelece a arquitetura React/Vite e os fluxos visuais base; operações de autenticação, assinatura e verificação dependem da API REST do backend e serão entregues em issues posteriores.

## Tecnologias

React, Vite, TypeScript strict, React Router, Tailwind CSS, Axios, ESLint, Prettier, Vitest e React Testing Library.

## Executar

Pré-requisito: Node.js 20+.

```bash
npm install
copy .env.example .env.local # Windows; use cp no Linux/macOS
npm run dev
```

Variáveis públicas: `VITE_API_BASE_URL` e `VITE_API_TIMEOUT_MS`. Não coloque secrets em variáveis `VITE_*`; tokens não são persistidos no localStorage e o cliente está preparado para cookies HttpOnly.

## Comandos

`npm run dev`, `npm run build`, `npm run preview`, `npm run lint`, `npm run typecheck` e `npm run test`.

## Rotas e layout

`/` inicial; `/login` login pendente; `/register` cadastro pendente; `/dashboard` painel pendente; `/sign` assinatura pendente; `/verify` verificação pública pendente; qualquer outra rota exibe 404. As rotas públicas usam `PublicLayout`; as rotas internas ficam agrupadas em `AppLayout`, prontas para receber um guard de autenticação futuro sem simular proteção hoje.

O layout interno possui `Header` e `Sidebar` responsivos. Em telas pequenas, o menu lateral abre por botão com `aria-expanded`, fecha ao navegar e mantém foco visível. A navegação usa `NavLink` para indicar a rota ativa sem recarregar a aplicação.

Componentes compartilhados em `src/components/ui.tsx`: `Button`, `Card`, `Input`, `Label`, `PageHeader`, `Badge`, `Alert` e `Container`. Estados em `src/components/feedback.tsx`: `LoadingSpinner`, `LoadingState`, `ErrorState` e `EmptyState`.

## Cadastro e login

As rotas `/register` e `/login` possuem formulários responsivos com labels associados, autocomplete, validação de e-mail, mostrar/ocultar senha e estados acessíveis. A senha exige pelo menos 12 caracteres, uma letra maiúscula, uma minúscula, um número e um símbolo, além de confirmação idêntica.

O cliente HTTP usa `VITE_API_BASE_URL` e `VITE_API_TIMEOUT_MS`, com `withCredentials` preparado para cookies HttpOnly. O serviço `src/services/auth.service.ts` usa provisoriamente `POST /auth/register` e `POST /auth/login`; esses caminhos e os formatos definitivos devem ser confirmados pelo contrato do backend.

Falhas de login usam mensagem genérica e não permitem enumeração de usuários. Respostas HTTP 429 e 423, `Retry-After`, indisponibilidade de rede e falhas temporárias têm feedback visual dedicado. O frontend não executa tentativas automáticas, não cria contadores locais e não persiste senha ou tokens.

## Passkeys e TOTP

As telas `/passkeys`, `/login` (opção de passkey), `/security/totp`, `/login/totp` e `/security/recovery-codes` preparam os fluxos de autenticação forte.

- Passkeys usam `@simplewebauthn/browser`; o desafio vem do backend e a confirmação só é exibida após a resposta do servidor. WebAuthn exige HTTPS ou `localhost`.
- O TOTP recebe do backend o QR Code, envia o código de seis dígitos para confirmação e não gera ou persiste o segredo no navegador.
- O desafio TOTP do login deve ser iniciado pelo backend com um identificador de transação pré-autenticação; nenhum token é criado pelo frontend antes da validação completa.
- Códigos de recuperação são apenas exibidos quando fornecidos pelo backend, podem ser copiados ou baixados localmente e não são persistidos.

Os endpoints atuais são provisórios: `/auth/passkeys/registration/options`, `/auth/passkeys/registration/verify`, `/auth/passkeys/authentication/options`, `/auth/passkeys/authentication/verify`, `/auth/totp/setup`, `/auth/totp/setup/confirm` e `/auth/totp/login/verify`. O backend ainda precisa definir os contratos definitivos, validar desafios, origem/RP ID, assinaturas, contadores, segredo TOTP, janela temporal, hashes dos códigos, rate limiting e emissão segura da sessão.

## Estrutura e arquitetura

`src/app` configura a aplicação e o roteador; `src/components/layout` contém layouts compartilhados; `src/pages` contém páginas; `src/services/api.ts` centraliza o cliente HTTP; `src/styles` contém estilos globais. O frontend comunica-se exclusivamente com a API REST e não acessa PostgreSQL.

## Segurança e status

Implementados: base responsiva, navegação, formulários de cadastro/login, passkeys via WebAuthn, telas TOTP e recuperação, validação orientativa de senha, feedback de erros de autenticação, cliente Axios com timeout e cookies HttpOnly. Pendentes no backend: hash e política efetiva de senhas, autenticação, JWT/sessões, rate limiting por IP/conta, bloqueio temporário, validação criptográfica WebAuthn, geração/validação TOTP, proteção real de rotas e contrato definitivo dos endpoints. Nenhum documento, token fictício ou credencial é usado nesta etapa.

## Validação

Execute `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` e `npm audit --omit=dev` antes de publicar alterações. Os testes cobrem rotas, indicação ativa, estados de feedback, renderização e foco por teclado.

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

## Estrutura e arquitetura

`src/app` configura a aplicação e o roteador; `src/components/layout` contém layouts compartilhados; `src/pages` contém páginas; `src/services/api.ts` centraliza o cliente HTTP; `src/styles` contém estilos globais. O frontend comunica-se exclusivamente com a API REST e não acessa PostgreSQL.

## Segurança e status

Implementados: base responsiva, navegação, estados informativos, cliente Axios com timeout, credenciais para refresh cookie e suporte futuro ao header Authorization. Pendentes: identidade (JWT/passkeys/TOTP), proteção real de rotas, upload/visualização, assinatura criptográfica, verificação e integração dos endpoints. Nenhum documento, token fictício ou credencial é usado nesta etapa.

## Validação

Execute `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` e `npm audit --omit=dev` antes de publicar alterações. Os testes cobrem rotas, indicação ativa, estados de feedback, renderização e foco por teclado.

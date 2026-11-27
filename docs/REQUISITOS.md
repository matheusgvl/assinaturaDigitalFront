# Requisitos e evidências — frontend

Checklist das issues do frontend, onde cada uma foi atendida e como foi validada. Requisitos de segurança do servidor (REQ-xx do backend) só são considerados atendidos quando implementados na API; aqui eles aparecem apenas como a parte de interface correspondente.

## Checklist por issue

| Issue | Escopo | PR | Evidência principal |
| --- | --- | --- | --- |
| #1 REQ 0.0 | Estrutura React, Vite, TypeScript strict | #14 | Build e lint |
| #2 FRONT-01 | Layout, rotas e componentes reutilizáveis | #15 | `components.test.tsx`, `App.test.tsx` |
| #3 FRONT-02 | Cadastro e login com senha | #16 | `auth.test.tsx`, `password-validation.test.ts` |
| #4 FRONT-03 | Interfaces de passkeys e TOTP | #17 | `security.test.tsx` |
| #5 FRONT-04 | Dashboard e rotas privadas | #18 | `session.test.tsx`, `app-routes.test.tsx` |
| #6 FRONT-05 | Upload seguro e prévia do PDF | #19 | `pdf-validation.test.ts`, `pdf.test.tsx` |
| #7 FRONT-06 | Posicionamento do selo | #20 | `seal-position.test.ts`, `signature.service.test.ts` |
| #8 FRONT-07 | Download do PDF assinado | #21 | `SignResult.test.tsx`, `pdf.test.tsx` |
| #9 FRONT-08 | Verificação pública | #22 | `verify.test.tsx`, `verification.service.test.ts` |
| #12 FRONT-11 | Integração HTTP, sessão e erros | #23 | `api.test.ts`, `login-flow.test.tsx` |
| #10 FRONT-09 | Dispositivos e sessões ativas | #24 | `security-pages.test.tsx`, `security.service.test.ts` |
| #11 FRONT-10 | Configurações e alertas | #25 | `account-security.test.tsx`, `account.service.test.ts` |
| #13 FRONT-12 | Testes, acessibilidade e README | este PR | `app-routes.test.tsx`, este documento, README |

## Itens da FRONT-12

| Item | Como foi atendido |
| --- | --- |
| Testar navegação, formulário, upload, posicionamento e verificação | `app-routes.test.tsx` monta a árvore real de rotas: rotas privadas redirecionam ao login preservando a origem, rotas públicas abrem sem sessão, rota inexistente mostra 404. Formulários, upload, selo e verificação têm testes próprios (tabela acima). |
| Testar erros de autenticação e sessão expirada | Login com mensagem genérica (`auth.test.tsx`), 2FA e logout (`login-flow.test.tsx`), refresh, concorrência e expiração (`api.test.ts`), aviso de sessão expirada (`session.test.tsx`). |
| Garantir rótulos, foco e navegação por teclado | Auditoria axe-core em 11 telas sem violações; link "Pular para o conteúdo" com foco no conteúdo principal; ícones decorativos ocultos de leitores de tela; selo ajustável pelas setas; confirmações com foco no botão de confirmar. |
| Criar README | README com instalação, variáveis, comandos, rotas, contratos com o backend e segurança. |
| Registrar evidências e checklist | Este documento. |

## Evidências de validação

Comandos executados na branch desta issue:

| Comando | Resultado |
| --- | --- |
| `npm run typecheck` | sem erros |
| `npm run lint` | sem erros |
| `npm run test` | 22 arquivos, 99 testes aprovados |
| `npm run build` | build concluído |
| `npm audit --omit=dev` | 0 vulnerabilidades |

Conferências manuais no navegador, com backend simulado:

- Login com senha, TOTP inválido e válido, retorno à rota de origem, recarga mantendo a sessão via refresh, logout e nova exigência de login.
- Upload de PDF válido e de arquivo falso; prévia paginada; clique no centro de uma página A4 gerando X 298 / Y 362 pt; hash SHA-256 igual ao calculado por `sha256sum`.
- Assinatura com barra de andamento e download com bytes idênticos aos devolvidos pela API.
- Verificação exibindo íntegro, adulterado, não encontrada e HTTP 429 com `Retry-After`.
- Revogação de passkey e encerramento de sessão após confirmação; "sair de todos" encerrando a sessão local.
- Troca de senha, desativação do TOTP com código e alertas novos aparecendo e sendo marcados como lidos.
- Contraste de cores (axe-core `color-contrast`) aprovado em todas as telas após ajuste do cinza de textos secundários.
- Navegação por teclado: primeiro Tab no link de pular conteúdo; Enter leva o foco ao conteúdo principal.

## Pendências conhecidas

- TOTP, passkeys, sessões avançadas e auditoria dependem de endpoints do backend que ainda estão em issues próprias.
- O contrato de documentos já está publicado sob `/api/v1/documents/sign` e `/api/v1/documents/verify`; o proxy de desenvolvimento assume esse prefixo.
- Páginas com rotação (`/Rotate`) usam o espaço de coordenadas exibido; alinhar com o backend.
- ID, data UTC, nome do assinante e hash do documento são confirmados pela resposta pública de verificação depois do download do PDF assinado.

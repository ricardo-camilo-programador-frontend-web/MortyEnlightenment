# HANDOFF - issue #6 MortyEnlightenment
Objetivo: resolver o checklist da issue #6 (deps vulneráveis, lint, tsc, title template, pnpm/Node fixo, headers, testes smoke).
Regras: pt-BR, LF, sem force-push, commits `:emoji: type(6_MortyEnlightenment_<desc>): ...`, não mexer em analytics (Clarity yyrpy0dlhk, GA G-87QFNQ4H1R).
Verificação: pnpm lint, npx nuxi typecheck (ou vue-tsc), pnpm test, pnpm build.

## Progresso

### Metricas Antes vs Depois
- **pnpm audit**:
  - Antes: 267 vulnerabilidades (7 critical, 132 high, 105 moderate, 23 low)
  - Depois: 2 vulnerabilidades (0 critical, 2 high, 0 moderate, 0 low - ambos sem patch upstream disponivel: `node-forge` GHSA-86w9-cpqp-85rv e `braces` GHSA-vfj7-8cjw-p6xm)
- **ESLint (`pnpm run lint`)**:
  - Antes: 45 erros
  - Depois: 0 erros / 0 warnings
- **Typecheck (`npx nuxi typecheck`)**:
  - Antes: 19 erros
  - Depois: 0 erros
- **Vitest (`pnpm run test`)**:
  - Antes: sem suite de testes
  - Depois: suite vitest configurada, script `test` adicionado, smoke test passando (2 testes em `tests/smoke.test.ts`)
- **Build (`pnpm run build`)**:
  - Antes: falha por lockfile incompativel / modulos obsoletos
  - Depois: build static SPA executando com sucesso e gerando bundle completo em `dist/` (`index.html`, `200.html`, `404.html`)

### Acoes Executadas
1. **Padronizacao pnpm e Node**:
   - `package-lock.json` removido
   - `packageManager` atualizado para `pnpm@9.15.9`
   - `engines` configurado com `node: ">=22.0.0"`
   - `.nvmrc` criado com `22`
   - `NODE_VERSION = "22"` configurado no `netlify.toml`
2. **Dependencias e Vulnerabilidades**:
   - Atualizado para Nuxt 3 estavel (`3.21.11`)
   - Removidos modulos obsoletos: `eslint-webpack-plugin`, `vite-plugin-eslint`, `nuxt-seo-kit`
   - Atualizados `@pinia/nuxt` (0.9.0), `pinia` (2.3.1), `@vueuse/nuxt` e `@vueuse/core` (12.8.2), `axios` (1.7.9)
   - Adicionados overrides em `pnpm` para `minimatch` e `postcss-selector-parser`
3. **SEO e Title**:
   - `siteName` atualizado para `'Morty Enlightenment'`
   - `siteDescription` atualizado para `'Catalogo interativo e explorador de personagens do multiverso de Rick and Morty.'`
   - Substituido `<SeoKit />` por `useHead` e `useSeoMeta` nativos em `app.vue`
   - Preservadas intactas todas as credenciais de analytics (Clarity, GA4, Counter.dev)
4. **Lint e Typecheck**:
   - Corrigidos espacamentos, trailing commas, curly braces e import orders
   - Tipos expliciatados via `import type` para compatibilidade com `verbatimModuleSyntax`
   - Simplificado `tsconfig.json` para estender diretamente `./.nuxt/tsconfig.json`
5. **Testes e Seguranca**:
   - Adicionado `vitest` e teste smoke em `tests/smoke.test.ts`
   - Headers de seguranca configurados no `netlify.toml` com CSP permissiva e compativel com Clarity, GA4 e counter.dev

### Pendencias
- Nenhuma pendencia tecnica local (lint, tsc, test e build passam com zero erros).
- Push pendente de autorizacao expressa do Ricardo (regra estrita: nao fazer push).

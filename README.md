# LifeLine.js — site

Site oficial do [lifeline.js](https://github.com/lifeline-js-org/lifeline-js): gerenciamento de ciclo de vida para aplicações Node.js.

> Inicie, conecte e encerre com segurança.

## Stack

- **SvelteKit 3** (runes) + **TypeScript** estrito
- **Tailwind CSS 4** via `@tailwindcss/vite`
- **shiki** para destaque de código (JS/TS)
- **marked** para a documentação em Markdown
- **Space Grotesk** + **JetBrains Mono** (fontes self-hosted via `@fontsource-variable`)
- Adapter **node** — o build gera um servidor em `dist/`, sobe com `npm run start`

## Deploy (Discloud)

O `discloud.config` aponta para os scripts do `package.json`:

| Campo | Valor | O que faz |
| --- | --- | --- |
| `BUILD` | `npm run build` | `vite build` → servidor em `dist/` |
| `START` | `npm run start` | `HOST=0.0.0.0 PORT=8080 node dist/index.js` |

As rotas principais são pré-renderizadas (`prerender = true` no `+layout.ts`) e servidas estaticamente pelo mesmo servidor; o adapter emite os HTMLs em `dist/prerendered/`.

## Estrutura

```
src/
  lib/
    code.ts              Exemplos JS/TS usados na home (API real do pacote)
    docs.ts              Renderizador Markdown + metadados das páginas
    highlight.ts         Wrapper do shiki
    docs/*.md            11 páginas de documentação em Markdown
    components/
      Header.svelte      Navegação fixa + busca (Cmd/Ctrl+K ou "/")
      Search.svelte      Command palette da documentação
      Hero.svelte        Abertura com abas app.js / app.ts
      Features.svelte    Seis comportamentos em grade
      Pulse.svelte       Traçado de batimento (canvas, reativo ao simulador)
      Simulator.svelte   Grafo interativo com rollback e SIGTERM
      Compare.svelte     Boot com e sem LifeLine.js
      Examples.svelte    Galeria dos 5 exemplos do repositório (JS/TS)
      Api.svelte         Referência de API + matriz de estados
      Errors.svelte      Contrato de erros (AggregateError/CleanupError)
      Tests.svelte       Suíte de testes e garantias
      DocsCta.svelte     Convite para a documentação
      Footer.svelte      Wordmark, batimento e pilares
  routes/
    +page.svelte         Home
    docs/[slug]/         Documentação prerenderizada (11 páginas)
```

## Comandos

```bash
npm install       # instala dependências
npm run dev       # servidor de desenvolvimento
npm run check     # svelte-check (tipos)
npm run build     # gera o servidor em dist/
npm start         # sobe dist/ em HOST/PORT (padrão 0.0.0.0:8080)
npm audit         # vulnerabilidades
```

## Conteúdo

Todo código exibido espelha a API real publicada em `lifeline.js` (v0.1.2):

- `new LifeLine({ logger? })`
- `register({ name, init, close?, dependsOn? })`
- `start()` / `shutdown()`
- `state: LifeLineState`
- `prettyLogger(options?)` + `LifeLineEvent` / `LifeLineLogger`
- `CleanupError`, `AggregateError`

A documentação cobre introdução, instalação, primeiro app, contrato do recurso, dependências, máquina de estados, erros e rollback, encerramento e sinais, logs estruturados, TypeScript e limitações v1.

## Segurança

O CSP é aplicado pelo SvelteKit (`csp.mode: 'auto'` no `vite.config.ts`): hashes em páginas pré-renderizadas, nonces em renderizações dinâmicas. O `static/_headers` complementa com `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP, HSTS e `frame-ancestors 'none'`.

## Licença

MIT

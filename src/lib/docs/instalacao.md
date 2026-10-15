# Instalação

## Requisitos

- **Node.js 24 ou superior.** O pacote é ESM-only (`"type": "module"`).
- Sem dependências de runtime: o `lifeline.js` publicado não instala nada além de si mesmo.

## Instalar

```bash
npm install lifeline.js
```

Ou com outro gerenciador:

```bash
pnpm add lifeline.js
yarn add lifeline.js
bun add lifeline.js
```

## Imports modulares

Além do entry principal, o núcleo está disponível como subpath — a mesma API, consumível como `lifeline.js/core`:

```js
import { LifeLine } from 'lifeline.js/core'
```

Os exports são idênticos nos dois caminhos:

| Export | Tipo |
| --- | --- |
| `LifeLine` | classe |
| `CleanupError` | classe |
| `prettyLogger` | função |
| `Resource` | interface (type-only) |
| `LifeLineState` | union type (type-only) |
| `LifeLineOptions` | interface (type-only) |
| `LifeLineEvent` | união discriminada (type-only) |
| `LifeLineLogger` | função (type-only) |
| `PrettyLoggerOptions` | interface (type-only) |

Módulos como `lifeline.js/http` e `lifeline.js/signals` estão no roadmap e ganharão subpaths próprios quando tiverem funcionalidade concreta.

## Verificar a instalação

```js
import { LifeLine } from 'lifeline.js'

const app = new LifeLine()
console.log(app.state) // "created"
```

Se o import falhar com `ERR_REQUIRE_ESM` ou `Unexpected token 'export'`, o seu runtime não está em modo ESM — cheque a versão do Node e o campo `"type"` no seu `package.json`.

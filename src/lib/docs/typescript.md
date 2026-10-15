# TypeScript

O lifeline.js é escrito em TypeScript e publica tipos junto com o código. Todos os exports tipados vêm dos dois entry points (`lifeline.js` e `lifeline.js/core`).

## Tipos exportados

```ts
import type {
  Resource,
  LifeLineState,
  LifeLineOptions,
  LifeLineEvent,
  LifeLineLogger,
  PrettyLoggerOptions
} from 'lifeline.js'
import { LifeLine, CleanupError, prettyLogger } from 'lifeline.js'
```

| Export | Kind | Descrição |
| --- | --- | --- |
| `LifeLine` | classe | O gerenciador de ciclo de vida. |
| `CleanupError` | classe | Erro de `close()`, com `resourceName` e `cause`. |
| `prettyLogger` | função | Formatador de console para os eventos do ciclo de vida. |
| `Resource` | interface | Contrato de um recurso registrado. |
| `LifeLineState` | union | `"created" \| "starting" \| "running" \| "stopping" \| "stopped" \| "failed"` |
| `LifeLineOptions` | interface | Configuração da construtora: `{ logger?: LifeLineLogger }`. |
| `LifeLineEvent` | união discriminada | Os 14 eventos do ciclo de vida, discriminados por `type`. |
| `LifeLineLogger` | função | Consumidor de eventos: `(event: LifeLineEvent) => void`. |
| `PrettyLoggerOptions` | interface | Opções do `prettyLogger`: `{ colors?, write? }`. |

## Recursos bem tipados

Anote cada recurso como `Resource` para pegar erros de digitação no `name`, em `dependsOn` e nas assinaturas de `init`/`close`:

```ts
import { LifeLine } from 'lifeline.js'
import type { LifeLineState, Resource } from 'lifeline.js'

const app = new LifeLine()

const database: Resource = {
  name: 'database',
  async init(): Promise<void> {
    await db.connect(process.env.DATABASE_URL!)
  },
  async close(): Promise<void> {
    await db.disconnect()
  }
}

const server: Resource = {
  name: 'server',
  dependsOn: [database.name],
  async init(): Promise<void> {
    await listen(3000)
  },
  async close(): Promise<void> {
    await new Promise<void>((resolve) => http.close(() => resolve()))
  }
}

app.register(database)
app.register(server)

await app.start()

const state: LifeLineState = app.state // "running"
```

## Narração de erros

Para distinguir o erro original de um `AggregateError` de limpeza, use `instanceof` — e faça o `narrowing` de `error.cause`, que é `unknown` no padrão:

```ts
import { CleanupError } from 'lifeline.js'

try {
  await app.start()
} catch (error: unknown) {
  if (error instanceof AggregateError) {
    const cause = error.cause as Error
    console.error('falha na inicialização:', cause.message)

    for (const cleanupError of error.errors) {
      if (cleanupError instanceof CleanupError) {
        console.error(
          `falha de limpeza em "${cleanupError.resourceName}":`,
          (cleanupError.cause as Error).message
        )
      }
    }
  } else if (error instanceof Error) {
    console.error('falha na inicialização:', error.message)
  }
  console.error('estado:', app.state satisfies LifeLineState)
  process.exitCode = 1
}
```

## Logger tipado

`LifeLineEvent` é uma união discriminada por `type`: um `switch` sobre `event.type` faz *narrowing* automático, sem casts.

```ts
import { LifeLine, prettyLogger } from 'lifeline.js'
import type { LifeLineEvent, LifeLineLogger } from 'lifeline.js'

// Consumidor próprio, com narrowing por discriminante.
const metrics: LifeLineLogger = (event: LifeLineEvent) => {
  switch (event.type) {
    case 'resource:ready':
      // Aqui event tem { name, durationMs } — sem casts.
      histogram.observe(event.durationMs, { resource: event.name })
      break
    case 'resource:failed':
      // E aqui { name, durationMs, error }.
      counter.increment('boot.failed', { resource: event.name })
      break
    case 'start:rejected':
      counter.increment('boot.rejected', { leaked: event.leakedCount })
      break
    default:
      break
  }
}

const app = new LifeLine({ logger: metrics })
```

O `prettyLogger` já devolve um `LifeLineLogger`, então funciona direto na construtora:

```ts
const app = new LifeLine({ logger: prettyLogger({ colors: false }) })
```

Para redirecionar a saída, `PrettyLoggerOptions.write` recebe cada linha como `string`:

```ts
import type { PrettyLoggerOptions } from 'lifeline.js'

const options: PrettyLoggerOptions = {
  colors: process.stdout.isTTY === true,
  write: (line: string): void => {
    process.stderr.write(`${line}\n`)
  }
}
```

## Subpath tipado

`lifeline.js/core` exporta os mesmos símbolos com os mesmos `.d.ts`. O `package.json` declara `exports` com `types` em cada subpath:

```ts
import { LifeLine } from 'lifeline.js/core'
import type { Resource } from 'lifeline.js/core'
```

## Configuração sugerida

Para consumir os tipos sem surpresas:

```json
{
  "compilerOptions": {
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "target": "es2023",
    "strict": true
  }
}
```

O pacote é ESM-only, então `module`/`moduleResolution` em `nodenext` (ou `node16`) é o caminho que resolve os subpaths corretamente.

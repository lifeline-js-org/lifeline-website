# Logs estruturados

O gerenciador emite eventos do ciclo de vida quando você passa um `logger` na construtora. Sem `logger`, nada é logado — comportamento e contrato de erros permanecem exatamente os mesmos.

## Ligar o logger

```js
import { LifeLine, prettyLogger } from 'lifeline.js'

const app = new LifeLine({ logger: prettyLogger() })
```

O `prettyLogger()` embutido imprime cada transição no console, com timestamp relativo ao início da observação, cores e durações:

```text
+0.00s    app.start()
+0.00s    config iniciando
+0.35s    config no ar · 0.35s
+0.35s    postgres iniciando (precisa de config)
+1.45s    postgres no ar · 1.10s
+1.45s    redis iniciando (precisa de config)
+2.05s    redis falhou: ETIMEDOUT redis:6379
+2.05s    queue, http ignorados: dependem de redis
+2.05s    rollback: encerrando 2 em ordem inversa
+2.05s    postgres encerrando
+2.70s    postgres encerrado · 0.65s
+2.70s    config encerrando
+2.85s    config encerrado · 0.15s
+2.85s    LifelineStartError: redis falhou · 2 encerrados · 0 vazaram
```

Essa saída vem de [`examples/logging.js`](https://github.com/lifeline-js-org/lifeline-js/blob/main/examples/logging.js): cinco recursos, o `redis` falha no `init()` e a subida inteira é desfeita.

> **`LifelineStartError` é só um resumo do log.** Não existe essa classe no pacote. O `start()` segue rejeitando com o erro original (ou `AggregateError` com falhas de limpeza), como descrito em [Erros e rollback](/docs/erros).

## Os eventos

O tipo `LifeLineEvent` é uma união discriminada por `type`, emitida de forma **síncrona**, no ponto exato de cada transição:

| Evento | Quando | Campos |
| --- | --- | --- |
| `start` | `start()` validou o grafo e a subida começou | — |
| `resource:starting` | um `init()` vai ser chamado | `name`, `dependsOn` |
| `resource:ready` | o `init()` concluiu | `name`, `durationMs` |
| `resource:failed` | o `init()` rejeitou (esse recurso não recebe `close()`) | `name`, `durationMs`, `error` |
| `resources:skipped` | recursos que dependem (direta ou transitivamente) do que falhou | `names`, `failedResource` |
| `resources:aborted` | recursos independentes que a subida abortada não chegou a tentar | `names` |
| `rollback` | o rollback começou | `count` |
| `close:start` | um `close()` vai ser chamado | `name`, `reason` (`"rollback" \| "shutdown"`) |
| `close:end` | um `close()` terminou | `name`, `durationMs`, `error?` |
| `start:resolved` | todos os recursos subiram; estado `running` | `durationMs` |
| `start:rejected` | a subida falhou e o rollback terminou | `failedResource`, `closedCount`, `leakedCount`, `error` |
| `shutdown` | `shutdown()` começou a encerrar | — |
| `shutdown:resolved` | todos os recursos fecharam; estado `stopped` | `durationMs` |
| `shutdown:rejected` | o encerramento terminou com falhas de limpeza | `errorCount`, `error` |

Vale reparar que `resources:skipped` e `resources:aborted` separam duas coisas distintas: quem **depende** do recurso que falhou e quem era apenas **independente**. Num boot com `database` → `queue` e `redis` (independente), se a `database` cair, `queue` é *skipped* e `redis` é *aborted*.

## prettyLogger()

```ts
function prettyLogger(options?: PrettyLoggerOptions): LifeLineLogger

interface PrettyLoggerOptions {
  colors?: boolean                      // padrão: cores quando há TTY e NO_COLOR ausente
  write?: (line: string) => void        // padrão: process.stdout
}
```

- **Cores** ligam automaticamente quando o `stdout` é TTY e `NO_COLOR` não está definido. `prettyLogger({ colors: true })` força em pipe/CI; `colors: false` desliga sempre.
- **`write`** recebe cada linha formatada, sem a quebra de linha — redirecione para um arquivo, um pipeline ou um logger de aplicação:

```js
import { appendFileSync } from 'node:fs'
import { prettyLogger } from 'lifeline.js'

const logger = prettyLogger({
  colors: false,
  write: (line) => appendFileSync('boot.log', `${line}\n`)
})

const app = new LifeLine({ logger })
```

## Logger próprio

`LifeLineLogger` é só um consumidor de eventos. Para enviar tudo para um serviço de métricas ou um log estruturado, implemente a função:

```js
import { LifeLine } from 'lifeline.js'

const app = new LifeLine({
  logger(event) {
    if (event.type === 'resource:failed') {
      metrics.increment('boot.resource.failed', { name: event.name })
      logger.error({ event: event.type, name: event.name, error: event.error })
      return
    }
    logger.debug({ event: event.type, ...event })
  }
})
```

O logger é chamado de forma **síncrona dentro do ciclo de vida**. Duas regras:

- **Mantenha-o rápido.** Ele segura a subida — um `await` caro aqui atrasa cada transição.
- **Não lance erros.** Uma exceção no logger interrompe o ciclo de vida no meio da transição; trate seus próprios erros antes de relançar.

## TypeScript

Os tipos do sistema de logs vêm dos dois entry points:

```ts
import { LifeLine, prettyLogger } from 'lifeline.js'
import type { LifeLineEvent, LifeLineLogger, PrettyLoggerOptions } from 'lifeline.js'

const describe: LifeLineLogger = (event: LifeLineEvent) => {
  switch (event.type) {
    case 'resource:ready':
      console.log(`${event.name} no ar em ${event.durationMs.toFixed(2)}ms`)
      break
    case 'start:rejected':
      console.error(`${event.failedResource} derrubou o boot; ${event.leakedCount} vazaram`)
      break
    default:
      console.log(event.type)
  }
}

const app = new LifeLine({ logger: describe })
```

O `switch` sobre `event.type` faz *narrowing* automático: dentro de cada ramo você tem os campos daquele evento, sem casts.

## Testes

A suíte cobre a sequência exata de eventos em cada cenário — sucesso, falha com rollback, rollback sujo, shutdown limpo e sujo — e a formatação do `prettyLogger`. Veja [`logger.test.mjs`](https://github.com/lifeline-js-org/lifeline-js/blob/main/test/logger.test.mjs) no repositório.

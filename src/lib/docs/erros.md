# Erros e rollback

Se um `init()` falha, os recursos já inicializados são fechados em ordem inversa (rollback) e o `start()` rejeita. O contrato de erros é explícito e tem dois ramos.

## Rollback limpo

Quando todos os `close()` do rollback funcionam, o erro original chega **como está** — mesmo objeto, mesma pilha, mesmo valor se não for `Error`:

```js
try {
  await app.start()
} catch (error) {
  // error é exatamente o que o init() rejeitou.
  console.error('Falha na inicialização:', error)
}
```

## Rollback com falhas de limpeza

Quando algum `close()` também falha, a rejeição é um `AggregateError`:

- `error.cause` — o erro original do `init()` que falhou.
- `error.errors` — um `CleanupError` por recurso que não conseguiu fechar.

Cada `CleanupError` traz `resourceName` (o nome do recurso) e o erro real em `cause`:

```js
import { CleanupError } from 'lifeline.js'

try {
  await app.start()
} catch (error) {
  if (error instanceof AggregateError) {
    console.error('Causa raiz:', error.cause)
    for (const cleanupError of error.errors) {
      if (cleanupError instanceof CleanupError) {
        console.error(`Falha ao fechar ${cleanupError.resourceName}:`, cleanupError.cause)
      }
    }
  } else {
    console.error('Falha na inicialização:', error)
  }
}
```

## Exemplo completo

```js
import { LifeLine } from 'lifeline.js'

const app = new LifeLine()

app.register({
  name: 'database',
  async init() {
    console.log('database: conectado')
  },
  async close() {
    // Simula uma falha real de limpeza (conexão travada, timeout...).
    throw new Error('database: timeout ao desconectar')
  }
})

app.register({
  name: 'server',
  async init() {
    console.log('server: iniciado')
  },
  async close() {
    console.log('server: parado')
  }
})

app.register({
  name: 'queue',
  async init() {
    // Este recurso falha ao iniciar — dispara o rollback dos anteriores.
    throw new Error('queue: não conseguiu conectar ao broker')
  }
})

try {
  await app.start()
  console.log('estado:', app.state)
} catch (error) {
  if (error instanceof AggregateError) {
    console.error('falha na inicialização:', error.cause.message)
    for (const cleanupError of error.errors) {
      console.error(
        `falha de limpeza em "${cleanupError.resourceName}":`,
        cleanupError.cause.message
      )
    }
  } else {
    console.error('falha na inicialização:', error.message)
  }
  console.error('estado:', app.state) // "failed"
  process.exitCode = 1
}
```

Saída esperada:

```
database: conectado
server: iniciado
falha na inicialização: queue: não conseguiu conectar ao broker
falha de limpeza em "database": database: timeout ao desconectar
estado: failed
```

## Políticas que valem conhecer

- **O rollback roda uma única vez.** Após a falha, o estado é `failed` (terminal) e `shutdown()` é um no-op. Os erros permanecem na Promise rejeitada do `start()`.
- **O recurso que falhou não recebe `close()`.** Cada `init()` limpa seus próprios efeitos parciais ao rejeitar.
- **Recursos que não fecharam não são re-tentados.** Durante um `shutdown()` com falha, trate-os manualmente a partir do `AggregateError`.

> **Reentrância.** `start()` e `shutdown()` armazenam suas Promises: chamadas concorrentes — inclusive de dentro de um `init()` — recebem a **mesma Promise**. Compartilhar a Promise significa que uma rejeição não tratada em qualquer chamada vira `unhandledRejection`. Trate cada chamada pelo consumidor.

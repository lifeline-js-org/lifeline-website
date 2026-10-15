# Encerramento e sinais

`shutdown()` fecha os recursos **na ordem inversa da inicialização efetiva**, aguardando cada `close()`. Recursos sem `close()` são ignorados. Falhas em `close()` não interrompem a limpeza: todos os recursos restantes são tentados.

## shutdown() básico

```js
await app.start()

// ... app rodando ...

await app.shutdown()
console.log(app.state) // "stopped"
```

## Encerramento gracioso com sinais

O padrão para serviços: um servidor HTTP real, derrubado em ordem inversa ao receber `SIGINT`/`SIGTERM`.

```js
import { createServer } from 'node:http'
import { LifeLine } from 'lifeline.js'

const PORT = Number(process.env.PORT ?? 3000)
const app = new LifeLine()

const server = createServer((request, response) => {
  response.end('lifeline: ok\n')
})

app.register({
  name: 'http-server',
  init() {
    return new Promise((resolve, reject) => {
      server.once('error', reject)
      server.listen(PORT, () => {
        console.log(`http-server: ouvindo em http://localhost:${PORT}`)
        resolve()
      })
    })
  },
  close() {
    // Aguarda as conexões abertas terminarem antes de fechar.
    return new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()))
    })
  }
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    console.log(`\n${signal} recebido: encerrando...`)
    app.shutdown().then(
      () => {
        console.log('encerrado com sucesso')
        process.exit(0)
      },
      (error) => {
        // AggregateError quando algum close() falhou.
        console.error('falha ao encerrar:', error)
        process.exit(1)
      }
    )
  })
}

await app.start()
```

## shutdown() durante a inicialização

Este é um detalhe importante do contrato: se `start()` ainda está em andamento (estado `starting`), `shutdown()` **lança imediatamente** — ele não agenda o encerramento para depois.

```js
const starting = app.start()

try {
  app.shutdown() // lança: "Não é possível chamar shutdown() enquanto a inicialização está em andamento"
} catch (error) {
  // Decida: aguarde start() (sucesso ou falha) e então chame shutdown().
}
```

Aguardar `await app.start()` antes de chamar `shutdown()` é o padrão correto — inclusive no handler de `SIGTERM`, se o sinal puder chegar durante a subida.

## Concorrência

Chamadas concorrentes a `shutdown()` compartilham a mesma operação, e chamadas posteriores reutilizam a mesma Promise — sem fechar nada duas vezes:

```js
// Seguro: as duas chamadas recebem a mesma Promise.
const a = app.shutdown()
const b = app.shutdown()
console.log(a === b) // true
```

## Erros durante o encerramento

Assim como no rollback, falhas em `close()` durante o shutdown viram um `AggregateError`, com um `CleanupError` por recurso:

```js
import { CleanupError } from 'lifeline.js'

try {
  await app.shutdown()
} catch (error) {
  if (error instanceof AggregateError) {
    for (const cleanupError of error.errors) {
      if (cleanupError instanceof CleanupError) {
        console.error(`Falha ao fechar ${cleanupError.resourceName}:`, cleanupError.cause)
      }
    }
  }
}
```

## shutdown() em failed é no-op

Após uma falha de boot, o rollback já rodou. `shutdown()` não tenta fechar nada de novo — não é mecanismo de recuperação. Os erros permanecem acessíveis na Promise rejeitada do `start()`.

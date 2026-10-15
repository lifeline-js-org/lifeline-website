# Primeiro app

Um recurso é um objeto com `name`, `init()` e, opcionalmente, `close()` e `dependsOn`. Os exemplos abaixo usam objetos imaginários (`db`, `server`); numa aplicação real, `init()` e `close()` chamam as APIs correspondentes.

## Registrar, iniciar, encerrar

```js
import { LifeLine } from 'lifeline.js'

const app = new LifeLine()

app.register({
  name: 'database',
  async init() {
    await db.connect(process.env.DATABASE_URL)
    console.log('Database connected')
  },
  async close() {
    await db.disconnect()
    console.log('Database disconnected')
  }
})

app.register({
  name: 'server',
  dependsOn: ['database'],
  async init() {
    server.listen(3000)
    console.log('Server started')
  },
  async close() {
    await new Promise((resolve) => server.close(resolve))
    console.log('Server stopped')
  }
})

await app.start()
```

Depois de `await app.start()`, o estado é `running`. Para derrubar tudo em ordem inversa:

```js
await app.shutdown()
console.log(app.state) // "stopped"
```

## close() é opcional

Recursos que não precisam de limpeza simplesmente não declaram `close()`:

```js
app.register({
  name: 'config',
  async init() {
    process.env.APP_CONFIG = await loadConfig()
  }
})
```

Durante o encerramento (ou o rollback), recursos sem `close()` são ignorados — nada de `if (typeof close === 'function')` espalhado pelo código.

## Ligar ao ciclo de vida do processo

O padrão recomendado para serviços de produção: aguardar `start()` antes de aceitar sinais, e tratar a rejeição de `shutdown()`.

```js
await app.start()

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    void app.shutdown().then(
      () => process.exit(0),
      (error) => {
        console.error('Falha ao encerrar:', error)
        process.exit(1)
      }
    )
  })
}
```

> **Atenção.** Se o sinal puder chegar durante a subida, aguarde `await app.start()` antes de registrar o handler — ou trate o erro síncrono que `shutdown()` lança no estado `starting`. Veja [Encerramento](/docs/encerramento).

## O que não fazer

- **Não chamar `register()` depois de `start()`.** Fora do estado `created`, `register()` lança.
- **Não reaproveitar o gerenciador após falha.** O estado `failed` é terminal; crie um `new LifeLine()` para tentar de novo.
- **Não tratar `shutdown()` como recuperação.** Após uma falha de boot, o rollback já rodou; `shutdown()` é um no-op.

/**
 * Exemplos usados na home, nos exemplos e na documentação.
 * API real do pacote lifeline.js (repositório lifeline-js-org/lifeline-js):
 * new LifeLine(), register({ name, init, close?, dependsOn? }), start(), shutdown(), state.
 * JS puro e a mesma aplicação em TypeScript bem tipado.
 */

export interface CodeSample {
	lang: 'js' | 'ts';
	code: string;
}

/* ——— quickstart do hero ——— */

export const quickstartJs: CodeSample = {
	lang: 'js',
	code: `import { LifeLine } from 'lifeline.js'

const app = new LifeLine()

app.register({
  name: 'database',
  async init() {
    await db.connect(process.env.DATABASE_URL)
  },
  async close() {
    await db.disconnect()
  }
})

app.register({
  name: 'server',
  dependsOn: ['database'],
  async init() {
    server.listen(3000)
  },
  async close() {
    await new Promise((resolve) => server.close(resolve))
  }
})

await app.start()`
};

export const quickstartTs: CodeSample = {
	lang: 'ts',
	code: `import { LifeLine } from 'lifeline.js'
import type { Resource } from 'lifeline.js'

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

await app.start()`
};

/* ——— comparação: sem e com LifeLine ——— */

export const manualCode = `let config, db, redis, queue, server

try {
  config = await loadConfig()
  ;[db, redis] = await Promise.all([
    connectDb(config),   // se o redis falhar aqui,
    connectRedis(config) // o db fica aberto, sem referência
  ])
  queue = await startQueue(redis)
  server = await listen(db, queue, 3000)
} catch (err) {
  await server?.close()
  await queue?.stop()
  await redis?.quit()
  await db?.end()
  throw err
}

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.once(sig, async () => {
    await server.close()
    await queue.stop()
    await Promise.all([redis.quit(), db.end()])
    process.exit(0)
  })
}`;

export const withLifelineJs: CodeSample = {
	lang: 'js',
	code: `import { LifeLine } from 'lifeline.js'

const app = new LifeLine()

app.register({
  name: 'config',
  async init() {
    config = await loadConfig()
  }
})

app.register({
  name: 'postgres',
  dependsOn: ['config'],
  async init() {
    db = await connectDb(config)
  },
  async close() {
    await db.end()
  }
})

app.register({
  name: 'redis',
  dependsOn: ['config'],
  async init() {
    redis = await connectRedis(config)
  },
  async close() {
    await redis.quit()
  }
})

app.register({
  name: 'queue',
  dependsOn: ['redis'],
  async init() {
    queue = await startQueue(redis)
  },
  async close() {
    await queue.stop()
  }
})

app.register({
  name: 'http',
  dependsOn: ['postgres', 'queue'],
  async init() {
    await listen(db, queue, 3000)
  },
  async close() {
    await new Promise((resolve) => server.close(resolve))
  }
})

await app.start() // rollback e shutdown já estão ligados`
};

export const withLifelineTs: CodeSample = {
	lang: 'ts',
	code: `import { LifeLine } from 'lifeline.js'
import type { Resource } from 'lifeline.js'

const app = new LifeLine()

let config: Config
let db: Database
let redis: RedisClient
let queue: Queue

const configResource: Resource = {
  name: 'config',
  async init(): Promise<void> {
    config = await loadConfig()
  }
}

const postgres: Resource = {
  name: 'postgres',
  dependsOn: ['config'],
  async init(): Promise<void> {
    db = await connectDb(config)
  },
  async close(): Promise<void> {
    await db.end()
  }
}

const redisResource: Resource = {
  name: 'redis',
  dependsOn: ['config'],
  async init(): Promise<void> {
    redis = await connectRedis(config)
  },
  async close(): Promise<void> {
    await redis.quit()
  }
}

const queueResource: Resource = {
  name: 'queue',
  dependsOn: ['redis'],
  async init(): Promise<void> {
    queue = await startQueue(redis)
  },
  async close(): Promise<void> {
    await queue.stop()
  }
}

const httpResource: Resource = {
  name: 'http',
  dependsOn: ['postgres', 'queue'],
  async init(): Promise<void> {
    await listen(db, queue, 3000)
  },
  async close(): Promise<void> {
    await new Promise<void>((resolve) => server.close(() => resolve()))
  }
}

app.register(configResource)
app.register(postgres)
app.register(redisResource)
app.register(queueResource)
app.register(httpResource)

await app.start()`
};

/* ——— exemplos executáveis (espelham examples/ do repositório) ——— */

export interface Example {
	slug: string;
	title: string;
	desc: string;
	file: string;
	js: CodeSample;
	ts: CodeSample;
}

export const examples: Example[] = [
	{
		slug: 'basico',
		title: 'Registro básico',
		desc: 'Um recurso com init() e close(), e outro só com init(). close() é opcional.',
		file: 'examples/basic.js',
		js: {
			lang: 'js',
			code: `import { LifeLine } from 'lifeline.js'

const app = new LifeLine()

app.register({
  name: 'database',
  async init() {
    // Na prática: await db.connect(process.env.DATABASE_URL)
    console.log('database: conectado')
  },
  async close() {
    console.log('database: desconectado')
  }
})

// close() é opcional: recursos sem limpeza não o declaram.
app.register({
  name: 'cache',
  async init() {
    console.log('cache: iniciado')
  }
})

await app.start()
console.log('estado:', app.state)

await app.shutdown()
console.log('estado:', app.state)`
		},
		ts: {
			lang: 'ts',
			code: `import { LifeLine } from 'lifeline.js'
import type { LifeLineState, Resource } from 'lifeline.js'

const app = new LifeLine()

const database: Resource = {
  name: 'database',
  async init(): Promise<void> {
    await db.connect(process.env.DATABASE_URL!)
    console.log('database: conectado')
  },
  async close(): Promise<void> {
    await db.disconnect()
    console.log('database: desconectado')
  }
}

const cache: Resource = {
  name: 'cache',
  async init(): Promise<void> {
    console.log('cache: iniciado')
  }
}

app.register(database)
app.register(cache)

await app.start()
console.log('estado:', app.state satisfies LifeLineState)

await app.shutdown()
console.log('estado:', app.state satisfies LifeLineState)`
		}
	},
	{
		slug: 'dependencias',
		title: 'Dependências',
		desc: 'dependsOn inverte a ordem de registro: database sobe antes, mesmo declarada por último.',
		file: 'examples/dependencies.js',
		js: {
			lang: 'js',
			code: `import { LifeLine } from 'lifeline.js'

const app = new LifeLine()

// Registrado ANTES da database de propósito: com dependsOn a ordem de
// registro não importa — o Lifeline resolve a ordem topológica.
app.register({
  name: 'server',
  dependsOn: ['database'],
  async init() {
    console.log('server: iniciado')
  },
  async close() {
    console.log('server: parado')
  }
})

app.register({
  name: 'queue-consumer',
  dependsOn: ['database'],
  async init() {
    console.log('queue-consumer: consumindo')
  },
  async close() {
    console.log('queue-consumer: parado')
  }
})

app.register({
  name: 'database',
  async init() {
    console.log('database: conectado')
  },
  async close() {
    console.log('database: desconectado')
  }
})

// Saída esperada:
//   init:  database → server → queue-consumer
//   close: queue-consumer → server → database
await app.start()
await app.shutdown()`
		},
		ts: {
			lang: 'ts',
			code: `import { LifeLine } from 'lifeline.js'
import type { Resource } from 'lifeline.js'

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
    httpServer.listen(3000)
  },
  async close(): Promise<void> {
    await new Promise<void>((resolve) => httpServer.close(() => resolve()))
  }
}

const queueConsumer: Resource = {
  name: 'queue-consumer',
  dependsOn: [database.name],
  async init(): Promise<void> {
    await consumer.run()
  },
  async close(): Promise<void> {
    await consumer.stop()
  }
}

app.register(server)
app.register(queueConsumer)
app.register(database)

// init:  database → server → queue-consumer
// close: queue-consumer → server → database
await app.start()
await app.shutdown()`
		}
	},
	{
		slug: 'erros',
		title: 'Rollback e erros',
		desc: 'Um init() falha: o que já subiu fecha em ordem inversa e start() rejeita com a causa raiz.',
		file: 'examples/error-handling.js',
		js: {
			lang: 'js',
			code: `import { LifeLine } from 'lifeline.js'

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
    // Causa raiz: o erro original do init() que falhou.
    console.error('falha na inicialização:', error.cause.message)

    // Cada falha de close(), identificada por recurso.
    for (const cleanupError of error.errors) {
      console.error(
        \`falha de limpeza em "\${cleanupError.resourceName}":\`,
        cleanupError.cause.message
      )
    }
  } else {
    console.error('falha na inicialização:', error.message)
  }
  console.error('estado:', app.state)
  process.exitCode = 1
}`
		},
		ts: {
			lang: 'ts',
			code: `import { LifeLine, CleanupError } from 'lifeline.js'
import type { LifeLineState, Resource } from 'lifeline.js'

const app = new LifeLine()

const database: Resource = {
  name: 'database',
  async init(): Promise<void> {
    await db.connect(process.env.DATABASE_URL!)
  },
  async close(): Promise<void> {
    throw new Error('database: timeout ao desconectar')
  }
}

const server: Resource = {
  name: 'server',
  async init(): Promise<void> {
    await listen(3000)
  },
  async close(): Promise<void> {
    await new Promise<void>((resolve) => http.close(() => resolve()))
  }
}

const queue: Resource = {
  name: 'queue',
  async init(): Promise<void> {
    throw new Error('queue: não conseguiu conectar ao broker')
  }
}

app.register(database)
app.register(server)
app.register(queue)

try {
  await app.start()
  console.log('estado:', app.state satisfies LifeLineState)
} catch (error: unknown) {
  if (error instanceof AggregateError) {
    const cause = error.cause as Error
    console.error('falha na inicialização:', cause.message)

    for (const cleanupError of error.errors) {
      if (cleanupError instanceof CleanupError) {
        console.error(
          \`falha de limpeza em "\${cleanupError.resourceName}":\`,
          (cleanupError.cause as Error).message
        )
      }
    }
  } else if (error instanceof Error) {
    console.error('falha na inicialização:', error.message)
  }
  console.error('estado:', app.state satisfies LifeLineState)
  process.exitCode = 1
}`
		}
	},
	{
		slug: 'logging',
		title: 'Logs do ciclo de vida',
		desc: 'prettyLogger: timestamps relativos, cores e o resumo da falha — emitidos pelo próprio gerenciador.',
		file: 'examples/logging.js',
		js: {
			lang: 'js',
			code: `import { LifeLine, prettyLogger } from 'lifeline.js'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const app = new LifeLine({ logger: prettyLogger() })

app.register({
  name: 'config',
  async init() {
    await sleep(350)
  },
  async close() {
    await sleep(150)
  }
})

app.register({
  name: 'postgres',
  dependsOn: ['config'],
  async init() {
    await sleep(1100)
  },
  async close() {
    await sleep(650)
  }
})

app.register({
  name: 'redis',
  dependsOn: ['config'],
  async init() {
    await sleep(600)
    // Este recurso falha ao iniciar — dispara o rollback dos anteriores.
    throw new Error('ETIMEDOUT redis:6379')
  }
})

app.register({
  name: 'queue',
  dependsOn: ['redis'],
  async init() {
    console.log('queue: consumindo')
  }
})

app.register({
  name: 'http',
  dependsOn: ['redis'],
  async init() {
    console.log('http: ouvindo')
  }
})

// Saída esperada (o init é sequencial: postgres sobe antes de redis):
//   app.start()
//   config iniciando
//   config no ar · 0.35s
//   postgres iniciando (precisa de config)
//   postgres no ar · 1.10s
//   redis iniciando (precisa de config)
//   redis falhou: ETIMEDOUT redis:6379
//   queue, http ignorados: dependem de redis
//   rollback: encerrando 2 em ordem inversa
//   postgres encerrando
//   postgres encerrado · 0.65s
//   config encerrando
//   config encerrado · 0.15s
//   LifelineStartError: redis falhou · 2 encerrados · 0 vazaram
try {
  await app.start()
} catch {
  // O logger já mostrou o resumo; aqui a decisão é da aplicação.
  console.log('start() rejeitou. O processo pode sair com código 1.')
  process.exitCode = 1
}`
		},
		ts: {
			lang: 'ts',
			code: `import { LifeLine, prettyLogger } from 'lifeline.js'
import type { Resource } from 'lifeline.js'

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

// prettyLogger() devolve um LifeLineLogger: (event: LifeLineEvent) => void.
const app = new LifeLine({ logger: prettyLogger() })

const config: Resource = {
  name: 'config',
  async init(): Promise<void> {
    await sleep(350)
  },
  async close(): Promise<void> {
    await sleep(150)
  }
}

const postgres: Resource = {
  name: 'postgres',
  dependsOn: ['config'],
  async init(): Promise<void> {
    await sleep(1100)
  },
  async close(): Promise<void> {
    await sleep(650)
  }
}

// Falha ao iniciar — o evento resource:failed carrega o error original.
const redis: Resource = {
  name: 'redis',
  dependsOn: ['config'],
  async init(): Promise<void> {
    await sleep(600)
    throw new Error('ETIMEDOUT redis:6379')
  }
}

const queue: Resource = {
  name: 'queue',
  dependsOn: ['redis'],
  async init(): Promise<void> {
    console.log('queue: consumindo')
  }
}

const http: Resource = {
  name: 'http',
  dependsOn: ['redis'],
  async init(): Promise<void> {
    console.log('http: ouvindo')
  }
}

for (const resource of [config, postgres, redis, queue, http]) {
  app.register(resource)
}

try {
  await app.start()
} catch (error: unknown) {
  // O logger já mostrou o resumo; aqui a decisão é da aplicação.
  console.log('start() rejeitou:', error instanceof Error ? error.message : error)
  process.exitCode = 1
}`
		}
	},
	{
		slug: 'shutdown',
		title: 'Encerramento gracioso',
		desc: 'Um servidor HTTP real: SIGINT e SIGTERM derrubam tudo em ordem inversa.',
		file: 'examples/graceful-shutdown.js',
		js: {
			lang: 'js',
			code: `import { createServer } from 'node:http'
import { LifeLine } from 'lifeline.js'

const PORT = Number(process.env.PORT ?? 3000)
const app = new LifeLine()

const server = createServer((request, response) => {
  response.end('lifeline: ok\\n')
})

app.register({
  name: 'http-server',
  init() {
    return new Promise((resolve, reject) => {
      server.once('error', reject)
      server.listen(PORT, () => {
        console.log(\`http-server: ouvindo em http://localhost:\${PORT}\`)
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
    console.log(\`\\n\${signal} recebido: encerrando...\`)
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
console.log('Ctrl+C para encerrar')`
		},
		ts: {
			lang: 'ts',
			code: `import { createServer } from 'node:http'
import { LifeLine } from 'lifeline.js'
import type { Resource } from 'lifeline.js'

const PORT = Number(process.env.PORT ?? 3000)
const app = new LifeLine()

const server = createServer((_request, response) => {
  response.end('lifeline: ok\\n')
})

const httpServer: Resource = {
  name: 'http-server',
  init(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      server.once('error', reject)
      server.listen(PORT, () => {
        console.log(\`http-server: ouvindo em http://localhost:\${PORT}\`)
        resolve()
      })
    })
  },
  close(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()))
    })
  }
}

app.register(httpServer)

const signals = ['SIGINT', 'SIGTERM'] as const
for (const signal of signals) {
  process.on(signal, () => {
    void app
      .shutdown()
      .then(() => {
        console.log('encerrado com sucesso')
        process.exit(0)
      })
      .catch((error: unknown) => {
        console.error('falha ao encerrar:', error)
        process.exit(1)
      })
  })
}

await app.start()
console.log('Ctrl+C para encerrar')`
		}
	}
];

/* ——— tratamento de erros na home ——— */

export const errorContractJs: CodeSample = {
	lang: 'js',
	code: `try {
  await app.start()
} catch (error) {
  if (error instanceof AggregateError) {
    console.error('Causa raiz:', error.cause)
    for (const cleanupError of error.errors) {
      console.error(\`Falha ao fechar \${cleanupError.resourceName}:\`, cleanupError.cause)
    }
  } else {
    console.error('Falha na inicialização:', error)
  }
}`
};

export const errorContractTs: CodeSample = {
	lang: 'ts',
	code: `import { CleanupError } from 'lifeline.js'
import type { LifeLineState } from 'lifeline.js'

try {
  await app.start()
} catch (error: unknown) {
  if (error instanceof AggregateError) {
    console.error('Causa raiz:', error.cause)
    for (const cleanupError of error.errors) {
      if (cleanupError instanceof CleanupError) {
        console.error(
          \`Falha ao fechar \${cleanupError.resourceName}:\`,
          cleanupError.cause
        )
      }
    }
  } else {
    console.error('Falha na inicialização:', error)
  }

  const state: LifeLineState = app.state // "failed"
}`
};

/* ——— testes ——— */

export const testSuiteJs: CodeSample = {
	lang: 'js',
	code: `import { test } from 'node:test'
import assert from 'node:assert/strict'
import { LifeLine } from 'lifeline.js'

test('rollback fecha o que subiu em ordem inversa', async () => {
  const app = new LifeLine()
  const order = []

  app.register({ name: 'db', init: () => {}, close: () => order.push('db') })
  app.register({ name: 'cache', init: () => {}, close: () => order.push('cache') })
  app.register({
    name: 'queue',
    init: () => {
      throw new Error('broker fora do ar')
    }
  })

  await assert.rejects(app.start(), /broker fora do ar/)
  assert.deepEqual(order, ['cache', 'db'])
  assert.equal(app.state, 'failed')
})`
};

export const testSuiteTs: CodeSample = {
	lang: 'ts',
	code: `import { test } from 'node:test'
import assert from 'node:assert/strict'
import { LifeLine } from 'lifeline.js'
import type { LifeLineState, Resource } from 'lifeline.js'

test('rollback fecha o que subiu em ordem inversa', async () => {
  const app = new LifeLine()
  const order: string[] = []

  const db: Resource = {
    name: 'db',
    init: () => {},
    close: () => {
      order.push('db')
    }
  }

  const cache: Resource = {
    name: 'cache',
    init: () => {},
    close: () => {
      order.push('cache')
    }
  }

  const queue: Resource = {
    name: 'queue',
    init: () => {
      throw new Error('broker fora do ar')
    }
  }

  app.register(db)
  app.register(cache)
  app.register(queue)

  await assert.rejects(app.start(), /broker fora do ar/)
  assert.deepEqual(order, ['cache', 'db'])

  const state: LifeLineState = app.state
  assert.equal(state, 'failed')
})`
};

# Dependências

`dependsOn?: readonly string[]` declara o que cada recurso precisa antes de subir. Sem dependências, a ordem efetiva é a de registro.

## Ordem topológica

A ordem de inicialização é resolvida por grafo: toda dependência é inicializada antes de quem depende dela. O encerramento inverte a ordem efetiva.

```js
const app = new LifeLine()

// Registrado ANTES da database de propósito: com dependsOn,
// a ordem de registro não importa.
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

await app.start()
await app.shutdown()

// Saída:
//   init:  database → server → queue-consumer
//   close: queue-consumer → server → database
```

Note que `server` e `queue-consumer` são independentes entre si: ambos dependem só da `database`, então a ordem relativa entre eles segue a de registro.

## Validação antes de qualquer init()

Antes de qualquer `init()`, `start()` valida o grafo e falha **síncronamente** — o gerenciador permanece em `created`, pronto para você corrigir e tentar de novo:

- **Dependência inexistente:** `Dependência inexistente: "server" depende de "queue", que não foi registrado`
- **Dependência duplicada:** `Dependência duplicada em "server": "database"`
- **Ciclo:** `Ciclo de dependência detectado: a → b → a` — o erro mostra o caminho do ciclo

```js
app.register({ name: 'a', dependsOn: ['b'], init: () => {} })
app.register({ name: 'b', dependsOn: ['a'], init: () => {} })

try {
  await app.start()
} catch (error) {
  // Error: Ciclo de dependência detectado: a → b → a
  console.error(error.message)
}

console.log(app.state) // ainda "created" — nada foi inicializado
```

## Regras de nomes

- `name` e `dependsOn` são copiados no registro: mutar o objeto depois de `register()` não afeta a configuração.
- Nomes devem ser não vazios e sem espaços nas bordas.
- Recursos sem dependência alguma são chamados de **raízes** e são os primeiros na ordem.

## Execução sequencial

A v1 inicializa **sequencialmente**: um `init()` por vez, na ordem resolvida. Isso significa que `dependsOn` também funciona como controle de paralelismo — recursos independentes sobem em ordem de registro, um após o outro, e qualquer falha no meio interrompe a subida e dispara o rollback.

## Grafos muito grandes

A ordem é resolvida por DFS recursivo. Cadeias de dependência extremamente longas podem estourar a pilha de chamadas — veja [Limitações v1](/docs/limitacoes).

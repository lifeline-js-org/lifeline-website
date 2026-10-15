# Contrato do recurso

A interface `Resource` é a única forma de descrever um recurso:

```ts
export interface Resource {
  readonly name: string
  readonly dependsOn?: readonly string[]
  init(): void | Promise<void>
  close?(): void | Promise<void>
}
```

## name

Identificador único dentro do gerenciador.

- Não pode ser vazio.
- Não pode começar nem terminar com espaço (`" db"` e `"db "` são recusados).
- Duplicar o nome lança `Recurso duplicado: "db" já foi registrado`.

`name` é **copiado** no registro: mutar `resource.name` depois do `register()` não afeta a configuração interna.

## init()

Executado por `start()`, na ordem resolvida pelo grafo de dependências. Pode ser síncrono ou assíncrono.

- Se rejeitar, o rollback é disparado: os recursos **anteriores** são fechados em ordem inversa.
- O recurso cujo `init()` falha **não** recebe `close()`. Cada `init()` é responsável por limpar seus próprios efeitos parciais quando rejeitar.

```js
app.register({
  name: 'queue',
  async init() {
    const connection = await broker.connect()
    try {
      await connection.assertQueue('jobs')
    } catch (error) {
      // init() falhou: o Lifeline não chamará close() — limpe aqui.
      await connection.close()
      throw error
    }
  }
})
```

## close()

Opcional. Chamado apenas se o `init()` correspondente **concluiu**.

- Durante o shutdown normal: na ordem inversa da inicialização efetiva.
- Durante o rollback: mesma ordem inversa, apenas para os que subiram.
- Falhas em `close()` não interrompem a limpeza: todos os restantes são tentados, e a rejeição vira `AggregateError` com um `CleanupError` por recurso.

```js
app.register({
  name: 'database',
  async init() {
    await db.connect(url)
  },
  async close() {
    // Se este throw for alcançado durante um shutdown, os outros
    // recursos continuam sendo fechados normalmente.
    await db.disconnect()
  }
})
```

## dependsOn

Lista estrita de nomes de dependências obrigatórias. Opcional; sem ele, a ordem efetiva é a de registro.

```js
app.register({
  name: 'server',
  dependsOn: ['database', 'queue'],
  async init() {
    /* ... */
  }
})
```

A validação acontece antes de qualquer `init()`, e falha síncronamente (o gerenciador permanece em `created`):

| Violação | Erro |
| --- | --- |
| Dependência que não foi registrada | `Dependência inexistente: "server" depende de "db", que não foi registrado` |
| Mesma dependência duas vezes | `Dependência duplicada em "server": "db"` |
| Ciclo | `Ciclo de dependência detectado: a → b → a` (mostra o caminho) |

`dependsOn` é copiado no registro, como o `name`. A referência original do objeto é preservada apenas para executar `init()` e `close()` com o `this` do usuário.

## Resumo das cópias

| Campo | Copiado no registro? | Executado no objeto original? |
| --- | --- | --- |
| `name` | sim | — |
| `dependsOn` | sim (array novo) | — |
| `init` | — | sim |
| `close` | — | sim |

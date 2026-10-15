# Máquina de estados

O estado é exposto pelo getter `state`, com o tipo `LifeLineState`:

```ts
type LifeLineState = 'created' | 'starting' | 'running' | 'stopping' | 'stopped' | 'failed'
```

## Transições

```
created ──start()──▶ starting ──▶ running ──shutdown()──▶ stopping ──▶ stopped
   │                    │
   │                    └──▶ failed (rollback concluído; terminal)
   └──shutdown()──────────────────────────────▶ stopping ──▶ stopped
```

| Estado | Significado |
| --- | --- |
| `created` | Construído. Único estado em que `register()` funciona. |
| `starting` | `start()` em andamento, inicializando recursos. |
| `running` | Todos os recursos inicializados com sucesso. |
| `stopping` | `shutdown()` em andamento. |
| `stopped` | Terminal: tudo que subiu foi fechado. |
| `failed` | Terminal: o boot falhou e o rollback concluiu. |

## Matriz de operações

| Operação | `created` | `starting` | `running` | `stopping` | `stopped` | `failed` |
| --- | --- | --- | --- | --- | --- | --- |
| `register()` | permite | lança | lança | lança | lança | lança |
| `start()` | inicia | mesma Promise | mesma Promise | lança | lança | mesma rejeição |
| `shutdown()` | encerra vazio | lança | encerra | mesma Promise | mesma Promise | no-op |

As violações de estado **lançam sincronamente**; falhas operacionais rejeitam a Promise. Essa separação é proposital: um erro de uso (estado errado) é um bug de programação e deve aparecer na pilha imediatamente, não como uma rejeição que pode ficar sem `catch`.

## shutdown() durante a inicialização

Se `start()` ainda está em andamento (estado `starting`), `shutdown()` **lança imediatamente** — ele não agenda o encerramento para depois:

```js
const starting = app.start()

try {
  app.shutdown() // lança: "Não é possível chamar shutdown() enquanto a inicialização está em andamento"
} catch (error) {
  // Decida: aguarde start() (sucesso ou falha) e então chame shutdown().
}
```

Um `init()` que chamar `shutdown()` sem tratar o erro falha por si só e dispara o rollback. Aguardar `await app.start()` antes de chamar `shutdown()` é o padrão correto.

## failed é terminal

Após uma falha, o estado fica `failed` e não há volta:

- O rollback é executado **uma única vez**, durante a falha.
- `shutdown()` é um no-op em `failed` — não é mecanismo de recuperação.
- Os erros permanecem acessíveis na Promise rejeitada do `start()`.
- Para tentar de novo, construa um novo `new LifeLine()`.

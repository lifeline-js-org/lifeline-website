# Introdução

O **lifeline.js** é gerenciamento de ciclo de vida para aplicações Node.js: inicialização sequencial de recursos, rollback em caso de falha e encerramento ordenado — com dependências entre recursos e um contrato de erros explícito.

Na prática, ele resolve três problemas que todo servidor maduro acaba enfrentando:

- **Boot na ordem errada.** O servidor sobe antes do banco aceitar conexão, e o primeiro request explode.
- **Boot que falha e vaza.** Um `init()` rejeita no meio do caminho e as conexões já abertas ficam penduradas, sem referência para fechá-las.
- **Desligamento manual.** O handler de `SIGTERM` repete — e diverge — da lógica de limpeza escrita no `catch` do boot.

## O contrato em uma frase

Registre recursos com `name`, `init()` e, opcionalmente, `close()` e `dependsOn`; chame `start()`; se algo falhar, tudo o que já subiu é desligado em ordem inversa e o erro original chega a você.

```js
import { LifeLine } from 'lifeline.js'

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

await app.start()
```

## O que este guia cobre

| Página | Assunto |
| --- | --- |
| [Instalação](/docs/instalacao) | `npm install`, requisitos de Node, ESM-only |
| [Primeiro app](/docs/comecando) | Registrar, iniciar e encerrar |
| [Contrato do recurso](/docs/recursos) | Os quatro campos de um recurso |
| [Dependências](/docs/dependencias) | Ordem topológica e validação do grafo |
| [Erros e rollback](/docs/erros) | O que `start()` entrega quando falha |
| [Encerramento](/docs/encerramento) | `shutdown()`, `SIGINT` e `SIGTERM` |
| [Logs estruturados](/docs/logs) | Eventos do ciclo de vida e `prettyLogger` |
| [TypeScript](/docs/typescript) | Tipos exportados e uso bem tipado |

> O lifeline.js não é um framework HTTP, nem um container de injeção de dependência. Ele só faz uma coisa: coordenar o nascimento e a morte dos recursos do seu processo.

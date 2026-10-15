# Limitações v1

A v1 é deliberadamente pequena. Conhecer os limites evita esperar comportamentos que ainda não existem.

## Sem retry automático

O estado `failed` é terminal. Se o `init()` de um banco caiu porque o container ainda estava subindo, o lifeline.js não tenta de novo — o boot falha, o rollback roda e você decide o próximo passo.

Para retry, implemente dentro do próprio `init()`:

```js
app.register({
  name: 'database',
  async init() {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await db.connect(url)
        return
      } catch (error) {
        if (attempt === 3) throw error
        await sleep(200 * attempt)
      }
    }
  }
})
```

## Sem inicialização paralela

Tudo é sequencial e aguardado: um `init()` por vez, na ordem resolvida pelo grafo. Recursos independentes não sobem em paralelo — eles sobem em ordem de registro, um depois do outro.

## dependsOn é lista estrita

Não há dependências opcionais, condicionais ou "se existir, use". A lista é de dependências obrigatórias: cada nome precisa apontar para um recurso registrado, sem duplicatas e sem ciclos.

## Ordem via DFS recursivo

A ordem de dependências é resolvida por DFS recursivo. Cadeias extremamente longas de dependências podem estourar a pilha de chamadas. Para a grande maioria dos grafos de aplicação isso é irrelevante; para grafos gerados programaticamente com milhares de nós em cadeia, atenção.

## Sem shutdown forçado

Não há timeout embutido no `close()` nem um "segundo sinal mata o processo". Se um `close()` travar, o `shutdown()` espera. O handler de sinal é seu para implementar a saída forçada — por exemplo, com um timer próprio no `SIGTERM`:

```js
process.on('SIGTERM', () => {
  setTimeout(() => process.exit(1), 10_000).unref()
  void app.shutdown().then(() => process.exit(0))
})
```

## rollback único

O rollback roda uma vez, na falha do boot. `shutdown()` após `failed` é no-op. Não há "reverter o rollback" nem expor os recursos parcialmente fechados para retomada.

## Roadmap

Módulos como `lifeline.js/http` (middlewares de servidor) e `lifeline.js/signals` (handlers de sinal prontos) estão no roadmap e ganharão subpaths próprios quando tiverem funcionalidade concreta. Ideias e PRs são bem-vindas no [repositório](https://github.com/lifeline-js-org/lifeline-js).

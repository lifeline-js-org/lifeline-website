<script lang="ts">
	const methods = [
		{
			sig: 'new LifeLine(options?: LifeLineOptions)',
			title: 'Construtor',
			body: 'Cria o gerenciador em estado created. Nenhum recurso é registrado implicitamente. Aceita { logger? } — um consumidor dos eventos do ciclo de vida; sem logger, nada é logado.'
		},
		{
			sig: 'register(resource: Resource): void',
			title: 'Registrar recurso',
			body: 'name e dependsOn são copiados no registro. Só funciona em created — fora dele, lança síncrono. Nome vazio, com espaço nas bordas ou duplicado são recusados.'
		},
		{
			sig: 'start(): Promise<void>',
			title: 'Iniciar',
			body: 'Valida o grafo, resolve a ordem topológica e inicializa sequencialmente. Em falha, faz rollback e rejeita. Chamadas concorrentes recebem a mesma Promise.'
		},
		{
			sig: 'shutdown(): Promise<void>',
			title: 'Encerrar',
			body: 'Fecha o que subiu na ordem inversa. No estado failed é no-op; durante starting lança síncrono. Falhas de close() viram AggregateError.'
		},
		{
			sig: 'state: LifeLineState',
			title: 'Estado',
			body: 'Getter somente-leitura: created | starting | running | stopping | stopped | failed.'
		},
		{
			sig: 'prettyLogger(options?: PrettyLoggerOptions): LifeLineLogger',
			title: 'Logger pronto',
			body: 'Formatador de console para os eventos do ciclo de vida: timestamp relativo (+1.45s), cores (TTY/NO_COLOR) e durações. options.colors força o estado; options.write redireciona a saída. Exportado também por lifeline.js/core.'
		}
	];

	const states: Array<[string, string]> = [
		['created', 'antes de start()'],
		['starting', 'inicializando'],
		['running', 'todos os recursos no ar'],
		['stopping', 'encerrando'],
		['stopped', 'terminal, limpo'],
		['failed', 'terminal, rollback concluído']
	];

	const matrix: Array<{ op: string; cells: Array<{ v: string; cls: string }> }> = [
		{
			op: 'register()',
			cells: [
				{ v: 'ok', cls: 'text-signal' },
				{ v: 'lança', cls: 'text-fault' },
				{ v: 'lança', cls: 'text-fault' },
				{ v: 'lança', cls: 'text-fault' },
				{ v: 'lança', cls: 'text-fault' },
				{ v: 'lança', cls: 'text-fault' }
			]
		},
		{
			op: 'start()',
			cells: [
				{ v: 'inicia', cls: 'text-bone' },
				{ v: 'mesma Promise', cls: 'text-mute' },
				{ v: 'mesma Promise', cls: 'text-mute' },
				{ v: 'lança', cls: 'text-fault' },
				{ v: 'lança', cls: 'text-fault' },
				{ v: 'mesma rejeição', cls: 'text-mute' }
			]
		},
		{
			op: 'shutdown()',
			cells: [
				{ v: 'encerra vazio', cls: 'text-bone' },
				{ v: 'lança', cls: 'text-fault' },
				{ v: 'encerra', cls: 'text-bone' },
				{ v: 'mesma Promise', cls: 'text-mute' },
				{ v: 'mesma Promise', cls: 'text-mute' },
				{ v: 'no-op', cls: 'text-mute' }
			]
		}
	];
</script>

<section id="api" class="border-b border-trace bg-ink-2/40">
	<div class="mx-auto max-w-6xl px-5 py-20 md:py-24">
		<div class="grid gap-14 lg:grid-cols-[0.85fr_1.35fr]">
			<div class="min-w-0 lg:sticky lg:top-24 lg:self-start">
				<h2 class="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">Uma classe, cinco métodos.</h2>
				<p class="mt-4 max-w-md text-lg leading-relaxed text-mute">
					A API pública inteira do <code class="font-mono text-[0.85em] text-bone">lifeline.js</code> — e também do subpath
					<code class="font-mono text-[0.85em] text-bone">lifeline.js/core</code>, com a mesma superfície.
				</p>

				<dl class="mt-8 space-y-2">
					{#each states as [state, desc] (state)}
						<div class="flex items-baseline gap-3 text-sm">
							<dt class="w-24 shrink-0 font-mono text-[0.72rem] text-signal">{state}</dt>
							<dd class="text-mute">{desc}</dd>
						</div>
					{/each}
				</dl>
			</div>

			<div class="min-w-0">
				<dl class="divide-y divide-trace border-y border-trace">
					{#each methods as m (m.sig)}
						<div class="grid gap-2 py-6 sm:grid-cols-[17rem_1fr] sm:gap-8">
							<dt class="font-mono text-[0.74rem] leading-relaxed break-words text-signal">{m.sig}</dt>
							<dd>
								<p class="font-medium">{m.title}</p>
								<p class="mt-1.5 max-w-xl text-sm leading-relaxed text-mute">{m.body}</p>
							</dd>
						</div>
					{/each}
				</dl>

				<h3 class="mt-12 text-base font-semibold">Matriz de operações por estado</h3>
				<div class="mt-4 overflow-x-auto">
					<table class="w-full min-w-[46rem] text-sm">
						<thead>
							<tr class="border-b border-trace-2">
								<th class="px-3 py-2 text-left font-medium">operação</th>
								{#each states as [state] (state)}
									<th class="px-3 py-2 text-left font-mono text-[0.68rem] font-medium text-mute">{state}</th>
								{/each}
							</tr>
						</thead>
						<tbody>
							{#each matrix as row (row.op)}
								<tr class="border-b border-trace">
									<td class="px-3 py-2.5 font-mono text-[0.72rem] text-bone">{row.op}</td>
									{#each row.cells as cell, i (i)}
										<td class="px-3 py-2.5 text-xs {cell.cls}">{cell.v}</td>
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				<p class="mt-3 text-xs text-mute">
					Violações de estado lançam <span class="font-mono text-bone">sincronamente</span>; falhas operacionais rejeitam a Promise.
				</p>
			</div>
		</div>
	</div>
</section>

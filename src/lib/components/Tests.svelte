<script lang="ts">
	import CodeTabs from './CodeTabs.svelte';
	import { Check } from '@lucide/svelte';

	let { js, ts }: { js: { html: string }; ts: { html: string } } = $props();

	const suite = [
		{ file: 'registration.test.mjs', behavior: 'Registro e validação de nomes/estados' },
		{ file: 'dependencies.test.mjs', behavior: 'Ordem de dependências e validação do grafo' },
		{ file: 'initialization.test.mjs', behavior: 'Inicialização e concorrência' },
		{ file: 'rollback.test.mjs', behavior: 'Rollback e preservação de erros' },
		{ file: 'shutdown.test.mjs', behavior: 'Encerramento e estados terminais' },
		{ file: 'logger.test.mjs', behavior: 'Eventos do ciclo de vida e prettyLogger' },
		{ file: 'package.test.mjs', behavior: 'Entry principal e subpaths' }
	];

	const guarantees = [
		'100% de linhas, branches e funções cobertas',
		'Roda com node --test contra o dist real, não contra src/',
		'Compila com tsc antes de cada execução — os testes validam o artefato publicado'
	];
</script>

<section id="testes" class="border-b border-trace">
	<div class="mx-auto max-w-6xl px-5 py-20 md:py-24">
		<div class="grid gap-12 lg:grid-cols-[1fr_1.15fr]">
			<div>
				<h2 class="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
					Os testes são parte do contrato.
				</h2>
				<p class="mt-4 max-w-md leading-relaxed text-mute">
					O comportamento documentado aqui é o mesmo comportamento verificado pela suíte: rollback, ordem de dependências,
					estados terminais e concorrência. Tudo com o runner nativo do Node — zero dependências de teste.
				</p>

				<ul class="mt-8 space-y-3">
					{#each guarantees as g (g)}
						<li class="flex items-start gap-3 text-sm text-bone/90">
							<Check size={16} class="mt-0.5 shrink-0 text-signal" strokeWidth={2.2} />
							{g}
						</li>
					{/each}
				</ul>

				<p class="mt-8 font-mono text-xs text-mute">$ npm test</p>
			</div>

			<div class="min-w-0">
				<div class="overflow-hidden rounded-lg border border-trace bg-ink-2/60">
					<CodeTabs
						label="testes"
						panels={[{ label: 'rollback.test.mjs', html: js.html }, { label: 'rollback.test.ts', html: ts.html }]}
					/>
				</div>

				<table class="mt-6 w-full text-sm">
					<caption class="sr-only">Arquivos da suíte de testes</caption>
					<thead>
						<tr class="border-b border-trace-2 text-left">
							<th class="py-2 pr-4 font-mono text-[0.68rem] font-medium text-mute">arquivo</th>
							<th class="py-2 font-medium text-mute">comportamento</th>
						</tr>
					</thead>
					<tbody>
						{#each suite as s (s.file)}
							<tr class="border-b border-trace">
								<td class="py-2.5 pr-4 font-mono text-[0.7rem] whitespace-nowrap text-signal">{s.file}</td>
								<td class="py-2.5 text-bone/80">{s.behavior}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</section>

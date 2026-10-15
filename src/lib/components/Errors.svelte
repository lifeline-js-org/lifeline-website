<script lang="ts">
	import CodeTabs from './CodeTabs.svelte';

	let { js, ts }: { js: { html: string }; ts: { html: string } } = $props();

	const policies = [
		{
			title: 'Rollback único',
			body: 'O rollback roda uma vez, na falha do boot. Depois disso o estado é failed (terminal) e shutdown() é um no-op.'
		},
		{
			title: 'Quem falhou não recebe close()',
			body: 'Cada init() é responsável por limpar seus próprios efeitos parciais quando rejeitar.'
		},
		{
			title: 'Limpeza nunca para no meio',
			body: 'Falhas em close() não interrompem o resto: todos os recursos restantes são tentados, e cada falha vira um CleanupError.'
		}
	];
</script>

<section id="erros" class="border-b border-trace bg-ink-2/40">
	<div class="mx-auto max-w-6xl px-5 py-20 md:py-24">
		<div class="grid gap-12 lg:grid-cols-[1fr_1.05fr]">
			<div>
				<h2 class="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
					Contrato de erros que você pode programar contra.
				</h2>
				<p class="mt-4 max-w-md leading-relaxed text-mute">
					Rollback limpo entrega o erro original como está — mesmo objeto, mesma pilha. Rollback sujo entrega um
					<code class="font-mono text-[0.85em] text-bone">AggregateError</code> com a causa raiz em
					<code class="font-mono text-[0.85em] text-bone">cause</code> e um
					<code class="font-mono text-[0.85em] text-bone">CleanupError</code> por recurso em
					<code class="font-mono text-[0.85em] text-bone">errors</code>.
				</p>

				<dl class="mt-8 space-y-5">
					{#each policies as p (p.title)}
						<div>
							<dt class="font-medium">{p.title}</dt>
							<dd class="mt-1 max-w-md text-sm leading-relaxed text-mute">{p.body}</dd>
						</div>
					{/each}
				</dl>
			</div>

			<div class="min-w-0 overflow-hidden rounded-lg border border-trace bg-ink">
				<CodeTabs label="erros" panels={[{ label: 'erros.js', html: js.html }, { label: 'erros.ts', html: ts.html }]} />
			</div>
		</div>
	</div>
</section>

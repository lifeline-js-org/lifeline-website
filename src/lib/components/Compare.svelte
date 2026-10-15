<script lang="ts">
	import CodeTabs from './CodeTabs.svelte';
	import { withLifelineJs, withLifelineTs } from '#lib/code.ts';

	let { manual, js, ts }: { manual: { html: string }; js: { html: string }; ts: { html: string } } = $props();
</script>

<section id="codigo" class="border-b border-trace bg-ink-2/40">
	<div class="mx-auto max-w-6xl px-5 py-20 md:py-24">
		<div class="max-w-2xl">
			<h2 class="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">O mesmo boot, com e sem LifeLine.js.</h2>
			<p class="mt-4 text-lg leading-relaxed text-mute">
				À esquerda, o try/catch que todo projeto acaba escrevendo. À direita, cada recurso declara o que precisa e como se encerra.
			</p>
		</div>

		<div class="mt-12 grid gap-6 lg:grid-cols-2">
			<figure class="min-w-0 overflow-hidden rounded-lg border border-trace bg-ink">
				<figcaption class="flex items-baseline justify-between border-b border-trace px-5 py-3 text-sm">
					<span class="font-medium">Na mão</span>
					<span class="text-xs text-fault">ordem e limpeza escritas à mão</span>
				</figcaption>
				<div class="overflow-x-auto px-5 py-4">{@html manual.html}</div>
				<p class="border-t border-trace px-5 py-3 text-sm text-mute">
					Cada recurso novo exige mexer em três lugares: o boot, o catch e o handler de sinal. Esquecer um deles vaza uma conexão.
				</p>
			</figure>

			<figure class="min-w-0 overflow-hidden rounded-lg border border-signal/30 bg-ink">
				<figcaption class="border-b border-trace">
					<CodeTabs label="comparacao" panels={[{ label: 'app.js', html: js.html }, { label: 'app.ts', html: ts.html }]} />
				</figcaption>
				<p class="border-t border-trace px-5 py-3 text-sm text-mute">
					A ordem sai do grafo. O rollback e o shutdown vêm ligados — o mesmo código em JavaScript puro e TypeScript bem tipado.
				</p>
			</figure>
		</div>
	</div>
</section>

<script lang="ts">
	import { DOCS } from '#lib/docs.ts';
	import { ArrowRight } from '@lucide/svelte';

	const highlights = ['comecando', 'dependencias', 'erros', 'logs'];
	const picks = $derived(highlights.map((slug) => DOCS.find((d) => d.slug === slug)!).filter(Boolean));
</script>

<section class="border-b border-trace">
	<div class="mx-auto max-w-6xl px-5 py-20 md:py-24">
		<div class="flex flex-wrap items-end justify-between gap-6">
			<div>
				<h2 class="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">Documentação.</h2>
				<p class="mt-4 max-w-xl leading-relaxed text-mute">
					{DOCS.length} páginas em Markdown — do primeiro boot às limitações conhecidas da v1. Cada comportamento
					descrito aqui é o mesmo verificado pela suíte de testes.
				</p>
			</div>
			<a
				href="/docs/introducao"
				class="flex items-center gap-2 rounded-md border border-trace px-4 py-2.5 text-sm font-medium text-bone transition-colors hover:border-signal/50 hover:text-signal"
			>
				Ler tudo <ArrowRight size={15} />
			</a>
		</div>

		<ul class="mt-10 grid gap-px overflow-hidden rounded-lg border border-trace bg-trace sm:grid-cols-2 lg:grid-cols-4">
			{#each picks as doc (doc.slug)}
				<li>
					<a href="/docs/{doc.slug}" class="block h-full bg-ink p-5 transition-colors hover:bg-ink-2">
						<span class="font-mono text-[0.66rem] tracking-wider text-signal">{doc.section}</span>
						<span class="mt-2 block font-medium">{doc.title}</span>
						<span class="mt-1.5 block text-sm leading-relaxed text-mute">{doc.summary}</span>
					</a>
				</li>
			{/each}
		</ul>
	</div>
</section>

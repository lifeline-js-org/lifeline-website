<script lang="ts">
	import { examples } from '#lib/code.ts';
	import { FileCode2 } from '@lucide/svelte';

	let { rendered }: {
		rendered: Record<string, { js: { html: string }; ts: { html: string } }>
	} = $props();

	let open = $state(examples[0]!.slug);
	let lang = $state<'js' | 'ts'>('js');
</script>

<section id="exemplos" class="border-b border-trace">
	<div class="mx-auto max-w-6xl px-5 py-20 md:py-24">
		<div class="flex flex-wrap items-end justify-between gap-6">
			<div class="max-w-2xl">
				<h2 class="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">Exemplos que rodam de verdade.</h2>
				<p class="mt-4 text-lg leading-relaxed text-mute">
					Do registro básico ao boot com logs estruturados e ao servidor HTTP com SIGINT/SIGTERM. Cada um existe em JavaScript
					e TypeScript, espelhando a pasta
					<code class="font-mono text-[0.85em] text-bone">examples/</code> do repositório.
				</p>
			</div>
			<div role="radiogroup" aria-label="Linguagem dos exemplos" class="flex rounded-md border border-trace p-1">
				{#each ['js', 'ts'] as l (l)}
					<button
						type="button"
						role="radio"
						aria-checked={lang === l}
						onclick={() => (lang = l as 'js' | 'ts')}
						class="cursor-pointer rounded px-3.5 py-1.5 font-mono text-xs transition-colors {lang === l
							? 'bg-bone text-ink'
							: 'text-mute hover:text-bone'}"
					>
						{l === 'js' ? 'JavaScript' : 'TypeScript'}
					</button>
				{/each}
			</div>
		</div>

		<div class="mt-10 grid gap-6 lg:grid-cols-[17rem_1fr]">
			<ul class="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0" aria-label="Escolher exemplo">
				{#each examples as ex (ex.slug)}
					<li class="min-w-[14rem] shrink-0 lg:min-w-0">
						<button
							type="button"
							aria-pressed={open === ex.slug}
							onclick={() => (open = ex.slug)}
							class="w-full cursor-pointer rounded-md border px-4 py-3 text-left transition-colors {open === ex.slug
								? 'border-signal/50 bg-ink-2'
								: 'border-trace hover:border-trace-2'}"
						>
							<span class="flex items-center gap-2 text-sm font-medium {open === ex.slug ? 'text-bone' : 'text-bone/80'}">
								<FileCode2 size={15} class={open === ex.slug ? 'text-signal' : 'text-mute'} />
								{ex.title}
							</span>
							<span class="mt-1 block font-mono text-[0.66rem] text-mute">{ex.file}</span>
						</button>
					</li>
				{/each}
			</ul>

			{#each examples as ex (ex.slug)}
				{#if open === ex.slug}
					<div class="min-w-0 overflow-hidden rounded-lg border border-trace bg-ink-2/60">
						<div class="border-b border-trace px-5 py-3.5">
							<h3 class="text-sm font-semibold">{ex.title}</h3>
							<p class="mt-1 text-sm text-mute">{ex.desc}</p>
						</div>
						<div class="overflow-x-auto px-5 py-4">
							{@html lang === 'js' ? rendered[ex.slug]!.js.html : rendered[ex.slug]!.ts.html}
						</div>
					</div>
				{/if}
			{/each}
		</div>
	</div>
</section>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { searchDocs, type SearchDoc } from '#lib/docs.ts';
	import { Search, CornerDownLeft } from '@lucide/svelte';

	let open = $state(false);
	let query = $state('');
	let active = $state(0);
	let input: HTMLInputElement | undefined = $state();
	let results: SearchDoc[] = $derived(searchDocs(query));

	function show() {
		open = true;
		query = '';
		active = 0;
		// espera o input existir no DOM
		requestAnimationFrame(() => input?.focus());
	}
	function hide() {
		open = false;
	}
	function move(delta: number) {
		if (results.length === 0) return;
		active = (active + delta + results.length) % results.length;
	}
	function go(doc: SearchDoc) {
		hide();
		void goto(`/docs/${doc.slug}`);
	}

	$effect(() => {
		if (active >= results.length) active = 0;
	});

	$effect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				hide();
			} else if (e.key === 'ArrowDown') {
				e.preventDefault();
				move(1);
			} else if (e.key === 'ArrowUp') {
				e.preventDefault();
				move(-1);
			} else if (e.key === 'Enter') {
				e.preventDefault();
				const doc = results[active];
				if (doc) go(doc);
			}
		};
		const onClick = () => hide();
		document.addEventListener('keydown', onKey);
		window.addEventListener('click', onClick);
		return () => {
			document.removeEventListener('keydown', onKey);
			window.removeEventListener('click', onClick);
		};
	});

	// atalho global: "/" ou Cmd/Ctrl+K abrem a busca
	$effect(() => {
		const onKey = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement | null;
			const typing = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;
			if (typing) return;
			if (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
				e.preventDefault();
				show();
			}
		};
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	});
</script>

<button
	type="button"
	onclick={(e) => {
		e.stopPropagation();
		show();
	}}
	class="group flex w-full max-w-xs cursor-pointer items-center gap-2.5 rounded-lg border border-trace bg-ink-2 px-3 py-2 text-left text-sm text-mute transition-colors hover:border-trace-2 hover:text-bone/80 lg:max-w-sm"
	aria-label="Buscar na documentação"
>
	<Search size={15} class="shrink-0" />
	<span class="flex-1 truncate">Buscar documentação...</span>
	<kbd class="hidden rounded border border-trace-2 bg-ink-3 px-1.5 py-0.5 font-mono text-[0.6rem] text-mute sm:block">/</kbd>
</button>

{#if open}
	<div class="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 pt-[12vh] backdrop-blur-sm" role="presentation">
		<div
			role="dialog"
			aria-modal="true"
			aria-label="Buscar na documentação"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => {
				if (e.key === 'Escape') hide();
			}}
			class="fade-up w-full max-w-lg overflow-hidden rounded-xl border border-trace-2 bg-ink-2 shadow-2xl shadow-black/60"
		>
			<div class="flex items-center gap-3 border-b border-trace px-4">
				<Search size={16} class="shrink-0 text-mute" />
				<input
					bind:this={input}
					bind:value={query}
					type="text"
					placeholder="Buscar páginas..."
					class="w-full bg-transparent py-3.5 font-sans text-sm text-bone placeholder:text-mute focus:outline-none"
				/>
				<kbd class="rounded border border-trace-2 bg-ink-3 px-1.5 py-0.5 font-mono text-[0.6rem] text-mute">esc</kbd>
			</div>

			{#if results.length > 0}
				<ul class="scroll-thin max-h-80 overflow-y-auto py-2">
					{#each results as doc, i (doc.slug)}
						<li>
							<button
								type="button"
								onclick={() => go(doc)}
								onmouseenter={() => (active = i)}
								class="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition-colors {active === i
									? 'bg-ink-3'
									: ''}"
								aria-current={active === i ? 'true' : undefined}
							>
								<span class="flex-1 min-w-0">
									<span class="block truncate text-sm font-medium {active === i ? 'text-signal' : 'text-bone'}">
										{doc.title}
									</span>
									<span class="block truncate text-xs text-mute">{doc.summary}</span>
								</span>
								<span class="shrink-0 font-mono text-[0.6rem] tracking-wider text-mute uppercase">{doc.group}</span>
								{#if active === i}
									<CornerDownLeft size={13} class="shrink-0 text-signal" />
								{/if}
							</button>
						</li>
					{/each}
				</ul>
			{:else if query.trim() !== ''}
				<div class="px-4 py-10 text-center">
					<p class="text-sm text-mute">Nada encontrado para “{query}”.</p>
					<p class="mt-1 text-xs text-mute/70">Tente “rollback”, “dependsOn” ou “shutdown”.</p>
				</div>
			{:else}
				<div class="px-4 py-6">
					<p class="font-mono text-[0.62rem] tracking-widest text-mute uppercase">Atalhos</p>
					<ul class="mt-3 space-y-1.5 text-sm text-mute">
						<li class="flex items-center gap-3">
							<kbd class="rounded border border-trace-2 bg-ink-3 px-1.5 py-0.5 font-mono text-[0.6rem]">/</kbd>
							abrir a busca
						</li>
						<li class="flex items-center gap-3">
							<kbd class="rounded border border-trace-2 bg-ink-3 px-1.5 py-0.5 font-mono text-[0.6rem]">↑ ↓</kbd>
							navegar resultados
						</li>
						<li class="flex items-center gap-3">
							<kbd class="rounded border border-trace-2 bg-ink-3 px-1.5 py-0.5 font-mono text-[0.6rem]">↵</kbd>
							abrir página
						</li>
					</ul>
				</div>
			{/if}
		</div>
	</div>
{/if}

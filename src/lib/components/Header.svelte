<script lang="ts">
	import { page } from '$app/state';
	import { SITE } from '#lib/site.ts';
	import { sectionSlug } from '#lib/docs.ts';
	import Search from './Search.svelte';
	import { GitBranch, Menu, X } from '@lucide/svelte';

	const nav = [
		{ href: '/docs/introducao', label: 'Docs', match: '/docs' },
		{ href: '/#simulador', label: 'Simulador', match: '' },
		{ href: '/#exemplos', label: 'Exemplos', match: '' },
		{ href: '/#api', label: 'API', match: '' },
		{ href: '/#testes', label: 'Testes', match: '' }
	];

	const isActive = (item: (typeof nav)[number]) =>
		item.match !== '' && page.url.pathname.startsWith(item.match);

	let menuOpen = $state(false);

	// fecha o menu móvel ao trocar de rota
	$effect(() => {
		void page.url.pathname;
		menuOpen = false;
	});
</script>

<header class="sticky top-0 z-40 border-b border-trace bg-ink/85 backdrop-blur-md">
	<div class="mx-auto flex h-16 max-w-7xl items-center gap-4 px-5">
		<a href="/" class="flex shrink-0 items-baseline gap-0.5 text-[1.1rem] font-semibold tracking-tight" aria-label="LifeLine.js, início">
			<span>Life</span><span class="text-signal">Line.js</span>
		</a>

		<nav class="ml-2 hidden items-center gap-0.5 md:flex" aria-label="Principal">
			{#each nav as item (item.label)}
				<a
					href={item.href}
					aria-current={isActive(item) ? 'page' : undefined}
					class="rounded-md px-3 py-1.5 text-sm transition-colors {isActive(item)
						? 'bg-ink-3 font-medium text-bone'
						: 'text-mute hover:text-bone'}"
				>
					{item.label}
				</a>
			{/each}
		</nav>

		<div class="ml-auto flex items-center gap-2.5">
			<div class="hidden sm:block"><Search /></div>
			<a
				href={SITE.github}
				rel="noopener noreferrer"
				class="hidden h-9 w-9 items-center justify-center rounded-md text-mute transition-colors hover:text-bone sm:flex"
				aria-label="Repositório no GitHub"
			>
				<GitBranch size={17} />
			</a>
			<a
				href="/docs/instalacao"
				class="rounded-md bg-bone px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:bg-signal"
			>
				Instalar
			</a>

			<!-- botão do menu móvel -->
			<button
				type="button"
				onclick={() => (menuOpen = !menuOpen)}
				aria-expanded={menuOpen}
				aria-controls="nav-movel"
				aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
				class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-mute transition-colors hover:text-bone md:hidden"
			>
				{#if menuOpen}
					<X size={19} />
				{:else}
					<Menu size={19} />
				{/if}
			</button>
		</div>
	</div>

	<!-- navegação móvel -->
	{#if menuOpen}
		<div id="nav-movel" class="border-t border-trace bg-ink px-5 py-3 md:hidden">
			<nav class="flex flex-col gap-1" aria-label="Principal (móvel)">
				{#each nav as item (item.label)}
					<a
						href={item.href}
						aria-current={isActive(item) ? 'page' : undefined}
						class="rounded-md px-3 py-2 text-sm transition-colors {isActive(item)
							? 'bg-ink-3 font-medium text-bone'
							: 'text-mute hover:text-bone'}"
					>
						{item.label}
					</a>
				{/each}
				<a href={SITE.github} rel="noopener noreferrer" class="rounded-md px-3 py-2 text-sm text-mute transition-colors hover:text-bone">
					Repositório
				</a>
			</nav>
			<div class="mt-2 border-t border-trace pt-2 sm:hidden"><Search /></div>
		</div>
	{/if}

	<!-- barra de seções da docs, como as abas do bun.com/docs -->
	{#if page.url.pathname.startsWith('/docs')}
		<div class="border-t border-trace/60">
			<nav class="scroll-thin mx-auto flex max-w-7xl gap-1 overflow-x-auto px-5" aria-label="Seções da documentação">
				{#each ['Começando', 'Conceitos', 'Referência'] as section (section)}
					<a
						href="#secao-{sectionSlug(section)}"
						class="shrink-0 border-b-2 border-transparent px-3 py-2.5 text-sm text-mute transition-colors hover:border-signal/40 hover:text-bone"
					>
						{section}
					</a>
				{/each}
				<a href="/#testes" class="shrink-0 border-b-2 border-transparent px-3 py-2.5 text-sm text-mute transition-colors hover:border-signal/40 hover:text-bone">
					Testes
				</a>
				<a href={SITE.github} rel="noopener noreferrer" class="shrink-0 border-b-2 border-transparent px-3 py-2.5 text-sm text-mute transition-colors hover:border-signal/40 hover:text-bone">
					Repositório
				</a>
			</nav>
		</div>
	{/if}
</header>

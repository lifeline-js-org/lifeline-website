<script lang="ts">
	import { page } from '$app/state';
	import { sections, neighbors, sectionSlug, FEATURED, type DocIcon } from '#lib/docs.ts';
	import Header from '#lib/components/Header.svelte';
	import Footer from '#lib/components/Footer.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { docGraph } from '#lib/seo.ts';
	import { Rocket, Layers, BookOpen, ChevronLeft, ChevronRight, ChevronDown, Check, Copy, Pencil } from '@lucide/svelte';
	import { SITE } from '#lib/site.ts';

	let { data } = $props();

	const groups = $derived(sections());
	const activeSlug = $derived(page.url.pathname.split('/').pop());
	const prevNext = $derived(activeSlug ? neighbors(activeSlug) : undefined);
	const isIntro = $derived(data.meta.slug === 'introducao');

	const ICONS: Record<DocIcon, typeof Rocket> = { rocket: Rocket, layers: Layers, book: BookOpen };

	let copied = $state(false);
	async function copyLink() {
		try {
			await navigator.clipboard.writeText(page.url.href);
			copied = true;
			setTimeout(() => (copied = false), 1800);
		} catch {
			/* clipboard indisponível */
		}
	}

	const editUrl = $derived(`${SITE.github}/edit/main/src/lib/docs/${data.meta.slug}.md`);

	// no mobile a sidebar vira um <details> recolhido; no desktop fica sempre aberta
	let sidebarOpen = $state(true);
	$effect(() => {
		const mq = window.matchMedia('(min-width: 1024px)');
		const apply = () => (sidebarOpen = mq.matches);
		apply();
		mq.addEventListener('change', apply);
		return () => mq.removeEventListener('change', apply);
	});
</script>

<Seo
	title={data.meta.title}
	description={data.meta.summary}
	path="docs/{data.meta.slug}"
	type="article"
	jsonLd={docGraph(data.meta)}
/>

<Header />

<div class="mx-auto max-w-7xl px-5">
	<div class="grid gap-10 lg:grid-cols-[16rem_1fr] xl:grid-cols-[16rem_1fr_13rem]">
		<!-- ——— sidebar agrupada (recolhível no mobile) ——— -->
		<aside class="scroll-thin py-6 lg:sticky lg:top-[8.5rem] lg:max-h-[calc(100vh-9rem)] lg:self-start lg:overflow-y-auto lg:py-10 lg:pr-2">
			<button
				type="button"
				onclick={() => (sidebarOpen = !sidebarOpen)}
				aria-expanded={sidebarOpen}
				aria-controls="docs-sidebar"
				class="mb-4 flex w-full cursor-pointer items-center justify-between rounded-lg border border-trace bg-ink-2 px-4 py-2.5 text-sm text-bone/80 transition-colors hover:border-trace-2 lg:hidden"
			>
				<span class="flex items-center gap-2">
					<BookOpen size={15} class="text-signal" />
					Explorar documentação
				</span>
				<ChevronDown size={16} class="text-mute transition-transform {sidebarOpen ? 'rotate-180' : ''}" />
			</button>

			<nav id="docs-sidebar" aria-label="Documentação" class="space-y-8 {sidebarOpen ? 'block' : 'hidden'} lg:block">
				{#each groups as group (group.name)}
					{@const Icon = ICONS[group.icon]}
					<div id="secao-{sectionSlug(group.name)}">
						<h2 class="flex items-center gap-2 px-2 text-[0.7rem] font-medium tracking-wider text-mute uppercase">
							<Icon size={13} class="text-signal" strokeWidth={2} />
							{group.name}
						</h2>
						<ul class="mt-2 space-y-0.5 border-l border-trace">
							{#each group.docs as doc (doc.slug)}
								<li>
									<a
										href="/docs/{doc.slug}"
										aria-current={activeSlug === doc.slug ? 'page' : undefined}
										class="-ml-px block border-l-2 py-1.5 pl-4 text-sm transition-colors {activeSlug === doc.slug
											? 'border-signal font-medium text-bone'
											: 'border-transparent text-mute hover:border-trace-2 hover:text-bone/80'}"
									>
										{doc.title}
									</a>
								</li>
							{/each}
						</ul>
					</div>
				{/each}
			</nav>
		</aside>

		<!-- ——— conteúdo ——— -->
		<article id="conteudo" class="min-w-0 py-10">
			<nav class="flex items-center gap-2 text-sm text-mute" aria-label="Trilha">
				<a href="/docs/introducao" class="transition-colors hover:text-bone">Docs</a>
				<span aria-hidden="true">/</span>
				<span class="text-signal">{data.meta.section}</span>
				<span aria-hidden="true">/</span>
				<span class="text-bone/80">{data.meta.title}</span>
			</nav>

			<div class="mt-4 flex flex-wrap items-start justify-between gap-4">
				<div>
					<h1 class="text-[2.4rem] leading-[1.05] font-semibold tracking-tight sm:text-[2.8rem]">
						{data.meta.title}
					</h1>
					<p class="mt-3 max-w-[58ch] text-lg leading-relaxed text-mute">
						{data.meta.summary}
					</p>
				</div>
				<div class="flex shrink-0 items-center gap-1.5">
					<button
						type="button"
						onclick={copyLink}
						class="flex cursor-pointer items-center gap-2 rounded-md border border-trace px-3 py-1.5 text-xs text-mute transition-colors hover:border-trace-2 hover:text-bone"
					>
						{#if copied}<Check size={13} class="text-signal" />{:else}<Copy size={13} />{/if}
						{copied ? 'Copiado' : 'Copiar link'}
					</button>
					<a
						href={editUrl}
						rel="noopener noreferrer"
						class="flex items-center gap-2 rounded-md border border-trace px-3 py-1.5 text-xs text-mute transition-colors hover:border-trace-2 hover:text-bone"
					>
						<Pencil size={13} /> Editar
					</a>
				</div>
			</div>

			{#if isIntro}
				<div class="mt-10 grid gap-px overflow-hidden rounded-xl border border-trace bg-trace sm:grid-cols-2">
					{#each FEATURED as card (card.slug)}
						{@const Icon = ICONS[card.icon]}
						<a href="/docs/{card.slug}" class="group flex flex-col bg-ink p-5 transition-colors hover:bg-ink-2">
							<Icon size={19} class="text-signal" strokeWidth={1.7} />
							<span class="mt-3 font-semibold">{card.title}</span>
							<span class="mt-1.5 flex-1 text-sm leading-relaxed text-mute">{card.body}</span>
							<span class="mt-4 flex items-center gap-1.5 text-sm text-bone transition-colors group-hover:text-signal">
								{card.cta}
								<ChevronRight size={14} class="transition-transform group-hover:translate-x-0.5" />
							</span>
						</a>
					{/each}
				</div>
			{/if}

			<div class="mdoc mt-10">
				{@html data.html}
			</div>

			{#if prevNext}
				<nav class="mt-16 flex flex-wrap justify-between gap-4 border-t border-trace pt-6" aria-label="Navegação entre páginas">
					{#if prevNext.prev}
						<a href="/docs/{prevNext.prev.slug}" class="group flex items-center gap-3 rounded-lg border border-trace px-4 py-3 text-sm text-mute transition-colors hover:border-signal/40 hover:text-bone">
							<ChevronLeft size={16} class="text-signal transition-transform group-hover:-translate-x-0.5" />
							<span>
								<span class="block text-xs text-mute">Anterior</span>
								{prevNext.prev.title}
							</span>
						</a>
					{:else}
						<span></span>
					{/if}
					{#if prevNext.next}
						<a href="/docs/{prevNext.next.slug}" class="group flex items-center gap-3 rounded-lg border border-trace px-4 py-3 text-right text-sm text-mute transition-colors hover:border-signal/40 hover:text-bone">
							<span>
								<span class="block text-xs text-mute">Próximo</span>
								{prevNext.next.title}
							</span>
							<ChevronRight size={16} class="text-signal transition-transform group-hover:translate-x-0.5" />
						</a>
					{/if}
				</nav>
			{/if}
		</article>

		<!-- ——— sumário da página (TOC) ——— -->
		{#if data.toc.length > 1}
			<aside class="scroll-thin hidden py-10 xl:block">
				<nav class="sticky top-[8.5rem] max-h-[calc(100vh-10rem)] overflow-y-auto pr-2" aria-label="Nesta página">
					<h2 class="text-[0.7rem] font-medium tracking-wider text-mute uppercase">Nesta página</h2>
					<ul class="mt-3 space-y-1 border-l border-trace">
						{#each data.toc.filter((t) => t.depth === 2) as item (item.id)}
							<li>
								<a href="#{item.id}" class="-ml-px block border-l-2 border-transparent py-1 pl-3 text-[0.8rem] text-mute transition-colors hover:border-signal/50 hover:text-bone">
									{item.text}
								</a>
							</li>
						{/each}
					</ul>
				</nav>
			</aside>
		{/if}
	</div>
</div>

<Footer />

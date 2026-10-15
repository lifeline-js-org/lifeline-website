<script lang="ts">
	import CopyCmd from './CopyCmd.svelte';
	import { SITE } from '#lib/site.ts';
	import { Power, Share2, ShieldCheck, Check } from '@lucide/svelte';

	const pillars = [
		{ icon: Power, label: 'Inicialização' },
		{ icon: Share2, label: 'Dependências' },
		{ icon: ShieldCheck, label: 'Encerramento' }
	];

	const links = [
		{ href: '/docs/introducao', label: 'Documentação' },
		{ href: '/#api', label: 'API' },
		{ href: '/#exemplos', label: 'Exemplos' },
		{ href: '/#testes', label: 'Testes' },
		{ href: SITE.github, label: 'GitHub', external: true },
		{ href: SITE.npm, label: 'npm', external: true }
	];
</script>

<footer class="relative overflow-hidden border-t border-trace bg-ink">
	<!-- círculos escuros de fundo, como na arte -->
	<div class="pointer-events-none absolute -top-40 -left-40 -z-0 size-96 rounded-full bg-ink-2" aria-hidden="true"></div>
	<div class="pointer-events-none absolute -right-32 -bottom-52 -z-0 size-[28rem] rounded-full bg-ink-2" aria-hidden="true"></div>

	<div class="relative mx-auto max-w-6xl px-5 pt-20 pb-10 md:pt-24">
		<div class="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
			<div>
				<p class="text-[clamp(3rem,9vw,5.5rem)] leading-none font-semibold tracking-tight">
					<span>Life</span><span class="text-signal">Line.js</span>
				</p>
				<p class="mt-5 max-w-md text-lg font-semibold text-bone/90">
					{SITE.tagline}
				</p>
				<div class="mt-8"><CopyCmd cmd={SITE.install} /></div>
			</div>

			<div class="hidden justify-center lg:flex" aria-hidden="true">
				<svg viewBox="0 0 560 300" class="glow-signal w-full max-w-md" fill="none">
					<!-- traçado do batimento: ponto, linha, vale, pico, linha, cursor, ponto -->
					<circle cx="16" cy="170" r="11" fill="#35e6a0" />
					<path
						d="M 48 170 H 150 C 168 170 172 210 188 236 C 202 258 214 252 220 210 L 238 60 C 244 22 258 22 264 60 L 284 246 C 288 274 302 276 316 240 C 328 208 340 170 358 170 H 420"
						stroke="#35e6a0" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"
					/>
					<circle cx="466" cy="170" r="30" stroke="#35e6a0" stroke-width="12" />
					<circle cx="466" cy="170" r="8" fill="#35e6a0" />
					<rect x="480" y="163" width="20" height="14" rx="7" fill="#35e6a0" />
					<circle cx="544" cy="170" r="11" fill="#35e6a0" />
					<!-- selo de confirmação -->
					<rect x="480" y="60" width="56" height="56" rx="14" stroke="#35e6a0" stroke-width="4" />
					<path d="M 494 88 L 506 100 L 524 78" stroke="#35e6a0" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
			</div>
		</div>

		<ul class="mt-16 grid max-w-lg grid-cols-3 gap-6">
			{#each pillars as p (p.label)}
				<li class="flex flex-col items-start gap-3">
					<p.icon size={26} class="text-mute" strokeWidth={1.5} />
					<span class="text-sm text-bone/90">{p.label}</span>
				</li>
			{/each}
		</ul>

		<nav class="mt-16 flex flex-wrap gap-x-6 gap-y-2 border-t border-trace pt-6 text-sm text-mute" aria-label="Rodapé">
			{#each links as l (l.label)}
				<a
					href={l.href}
					rel={l.external ? 'noopener noreferrer' : undefined}
					class="transition-colors hover:text-bone"
				>
					{l.label}
				</a>
			{/each}
		</nav>

		<div class="mt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-mute">
			<p>LifeLine.js v{SITE.version} · {SITE.engine}</p>
			<p class="flex items-center gap-2">
				<Check size={13} class="text-signal" strokeWidth={2.5} />
				MIT License · feito por <a href="https://github.com/viny-dev" rel="noopener noreferrer" class="transition-colors hover:text-bone">viny_dev</a>
			</p>
		</div>
	</div>
</footer>

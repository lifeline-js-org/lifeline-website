<script lang="ts">
	import CopyCmd from './CopyCmd.svelte';
	import CodeTabs from './CodeTabs.svelte';
	import { SITE } from '#lib/site.ts';
	import { quickstartJs, quickstartTs } from '#lib/code.ts';

	let { js, ts }: { js: { html: string }; ts: { html: string } } = $props();
</script>

<section class="relative isolate overflow-hidden border-b border-trace">
	<img
		src="/circuit.webp"
		alt=""
		width="1024"
		height="1024"
		fetchpriority="high"
		class="art-fade pointer-events-none absolute top-1/2 right-0 -z-10 h-[150%] w-auto max-w-none -translate-y-1/2 object-cover opacity-40 md:right-[-10%]"
	/>
	<div class="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/85 to-transparent md:via-ink/55"></div>

	<div class="mx-auto grid max-w-6xl items-start gap-14 px-5 pt-16 pb-20 md:pt-24 md:pb-28 lg:grid-cols-[1fr_1.05fr]">
		<div>
			<p class="font-mono text-xs tracking-widest text-signal">v{SITE.version} · {SITE.engine}</p>
			<h1 class="mt-5 text-[clamp(2.8rem,7vw,5rem)] leading-[0.95] font-semibold tracking-tight">
				<span class="block">Life<span class="text-signal">Line.js</span></span>
			</h1>
			<p class="mt-5 max-w-[30rem] text-xl leading-snug font-semibold text-bone/90">
				{SITE.tagline}
			</p>
			<p class="mt-5 max-w-[32rem] leading-relaxed text-mute">
				Coordene a inicialização, as dependências e o encerramento dos recursos da sua aplicação Node.js.
				Se algo falhar no boot, tudo o que já subiu é desligado em ordem inversa — sem vazar conexão.
			</p>
			<div class="mt-8 flex flex-wrap items-center gap-3">
				<a
					href="/docs/introducao"
					class="rounded-md bg-bone px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-signal"
				>
					Começar
				</a>
				<a
					href="#simulador"
					class="rounded-md border border-trace px-5 py-2.5 text-sm font-medium text-bone transition-colors hover:border-signal/50 hover:text-signal"
				>
					Quebrar o boot
				</a>
			</div>
			<div class="mt-8"><CopyCmd cmd={SITE.install} /></div>
		</div>

		<div class="min-w-0 rounded-lg border border-trace bg-ink-2/80">
			<CodeTabs label="quickstart" panels={[{ label: 'app.js', html: js.html }, { label: 'app.ts', html: ts.html }]} />
		</div>
	</div>
</section>

<script lang="ts">
	import { Timer, Gauge, Layers } from '@lucide/svelte';

	// Medido de verdade contra o dist do lifeline.js 0.1.2 (node:perf_hooks, Node 22).
	// "overhead" = gerenciador vs. chamar init()/close() na mão, no mesmo loop.
	const rows = [
		{ n: 10, managed: 0.009, direct: 0.0027, per: 0.62 },
		{ n: 50, managed: 0.026, direct: 0.0068, per: 0.38 },
		{ n: 100, managed: 0.05, direct: 0.0125, per: 0.37 },
		{ n: 500, managed: 0.284, direct: 0.069, per: 0.43 }
	];

	// escala para a barra: 500 recursos é a referência máxima
	const max = Math.max(...rows.map((r) => r.managed));
	const bar = (v: number) => Math.max(3, (v / max) * 100);

	const highlights = [
		{
			icon: Timer,
			value: '~0,4 µs',
			label: 'de overhead por recurso',
			note: 'sub-microssegundo — imperceptível em boot real'
		},
		{
			icon: Layers,
			value: '0,28 ms',
			label: '500 recursos · boot + shutdown',
			note: 'ciclo completo, do register ao stopped'
		},
		{
			icon: Gauge,
			value: '~19 mil',
			label: 'ciclos por segundo (100 recursos)',
			note: 'start() + shutdown() inteiros, back-to-back'
		}
	];
</script>

<section id="benchmark" class="border-b border-trace">
	<div class="mx-auto max-w-6xl px-5 py-20 md:py-24">
		<div class="max-w-2xl">
			<p class="font-mono text-xs tracking-widest text-signal">benchmark</p>
			<h2 class="mt-3 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
				O gerenciador custa µs, não ms.
			</h2>
			<p class="mt-4 text-lg leading-relaxed text-mute">
				Medimos o ciclo inteiro — <code class="font-mono text-[0.9em] text-bone">register</code> →
				<code class="font-mono text-[0.9em] text-bone">start()</code> →
				<code class="font-mono text-[0.9em] text-bone">shutdown()</code> — contra chamar
				<code class="font-mono text-[0.9em] text-bone">init()</code> e
				<code class="font-mono text-[0.9em] text-bone">close()</code> na mão, no mesmo loop, com recursos
				vazios. A diferença é o custo real da coordenação.
			</p>
		</div>

		<div class="mt-10 grid gap-4 sm:grid-cols-3">
			{#each highlights as h (h.value)}
				<div class="rounded-xl border border-trace bg-ink-2/60 p-5">
					<h.icon size={18} class="text-signal" strokeWidth={2.2} />
					<p class="mt-3 font-mono text-2xl font-bold text-bone">{h.value}</p>
					<p class="mt-1 text-sm font-semibold text-bone/85">{h.label}</p>
					<p class="mt-1 text-[0.8rem] leading-snug text-mute">{h.note}</p>
				</div>
			{/each}
		</div>

		<!-- tabela de medição -->
		<div class="mt-8 overflow-hidden rounded-xl border border-trace">
			<div class="scroll-thin overflow-x-auto">
				<table class="w-full min-w-[36rem] border-collapse text-sm">
					<thead>
						<tr class="border-b border-trace-2 bg-ink-2/60 text-left text-xs tracking-wide text-mute uppercase">
							<th class="px-4 py-3 font-medium">Recursos</th>
							<th class="px-4 py-3 font-medium">Gerenciado</th>
							<th class="px-4 py-3 font-medium">Manual</th>
							<th class="px-4 py-3 font-medium">Overhead / recurso</th>
							<th class="w-[38%] px-4 py-3 font-medium">Ciclo completo</th>
						</tr>
					</thead>
					<tbody>
						{#each rows as r (r.n)}
							<tr class="border-b border-trace last:border-b-0">
								<td class="px-4 py-3 font-mono text-bone">{r.n}</td>
								<td class="px-4 py-3 font-mono text-bone/80">{r.managed.toFixed(3)} ms</td>
								<td class="px-4 py-3 font-mono text-mute">{r.direct.toFixed(4)} ms</td>
								<td class="px-4 py-3 font-mono text-signal">+{r.per.toFixed(2)} µs</td>
								<td class="px-4 py-3">
									<div class="flex items-center gap-3">
										<div class="h-2 flex-1 overflow-hidden rounded-full bg-ink-3">
											<div
												class="h-full rounded-full bg-gradient-to-r from-signal-dim to-signal"
												style="width: {bar(r.managed)}%"
											></div>
										</div>
										<span class="w-16 shrink-0 text-right font-mono text-[0.72rem] text-mute">
											{r.managed.toFixed(2)} ms
										</span>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<p class="mt-4 text-[0.8rem] text-mute">
			Números medidos com <code class="font-mono text-bone/70">node:perf_hooks</code> contra o
			<code class="font-mono text-bone/70">dist</code> publicado, com warmup e mediana de milhares de iterações.
			Recursos sem I/O — em boot real o tempo é dominado pelo seu próprio <code class="font-mono text-bone/70">init()</code>, não pela coordenação.
		</p>
	</div>
</section>

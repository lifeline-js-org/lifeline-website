<script lang="ts">
	import { sim, SPECS, type NodeState } from '#lib/sim.svelte.ts';
	import { Play, Power, Eraser, Bug } from '@lucide/svelte';

	let logEl: HTMLDivElement;
	const canPick = $derived(!sim.busy && sim.phase !== 'running');

	const STATE_TXT: Record<NodeState, string> = {
		idle: 'parado',
		starting: 'subindo',
		up: 'no ar',
		failed: 'falhou',
		stopping: 'encerrando',
		down: 'encerrado',
		skipped: 'ignorado'
	};
	const NODE_CLS: Record<NodeState, string> = {
		idle: 'border-trace text-mute bg-ink',
		starting: 'border-cursor text-bone bg-cursor/10',
		up: 'border-signal/70 text-bone bg-signal/10',
		failed: 'border-fault text-bone bg-fault/15',
		stopping: 'border-amber text-bone bg-amber/10',
		down: 'border-trace text-mute/70 bg-ink',
		skipped: 'border-dashed border-mute/40 text-mute/60 bg-ink'
	};
	const DOT_CLS: Record<NodeState, string> = {
		idle: 'bg-trace',
		starting: 'bg-cursor motion-safe:animate-pulse',
		up: 'bg-signal',
		failed: 'bg-fault',
		stopping: 'bg-amber motion-safe:animate-pulse',
		down: 'border border-mute/60',
		skipped: 'border border-dashed border-mute/50'
	};
	const LOG_CLS = { info: 'text-bone', ok: 'text-signal', warn: 'text-amber', error: 'text-fault', dim: 'text-mute' };

	const spec = (id: string) => SPECS.find((s) => s.id === id)!;
	const edges = SPECS.flatMap((t) =>
		t.needs.map((n) => {
			const s = spec(n);
			const x1 = s.x + 9,
				x2 = t.x - 9,
				mx = (x1 + x2) / 2;
			return { from: s.id, to: t.id, d: `M ${x1} ${s.y} C ${mx} ${s.y}, ${mx} ${t.y}, ${x2} ${t.y}` };
		})
	);
	function edgeCls(from: string, to: string) {
		const a = sim.states[from],
			b = sim.states[to];
		if (b === 'failed') return 'stroke-fault';
		if (b === 'starting') return 'stroke-cursor edge-flow';
		if (a === 'up' && b === 'up') return 'stroke-signal';
		if (a === 'stopping' || b === 'stopping') return 'stroke-amber';
		return 'stroke-trace';
	}

	$effect(() => {
		sim.log.length;
		logEl?.scrollTo({ top: logEl.scrollHeight });
	});
</script>

<section id="simulador" class="mx-auto max-w-6xl px-5 py-24">
	<div class="max-w-2xl">
		<h2 class="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">Escolha onde o boot vai falhar.</h2>
		<p class="mt-4 text-lg leading-relaxed text-mute">
			Este é o grafo de uma API real: o <code class="font-mono text-[0.9em] text-bone">http</code> precisa do
			<code class="font-mono text-[0.9em] text-bone">postgres</code> e da <code class="font-mono text-[0.9em] text-bone">queue</code>.
			Marque um recurso, inicie, e acompanhe o rollback no traço fixo no topo da página.
		</p>
	</div>

	<div class="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
		<div role="radiogroup" aria-label="Recurso que vai falhar" class="flex flex-wrap items-center gap-1 rounded-md border border-trace p-1">
			<button
				type="button"
				role="radio"
				aria-checked={sim.failAt === null}
				disabled={!canPick}
				onclick={() => (sim.failAt = null)}
				class="rounded px-3 py-1.5 font-mono text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50 {sim.failAt === null
					? 'bg-signal text-ink'
					: 'text-mute hover:text-bone'}"
			>
				nenhum
			</button>
			{#each SPECS as s (s.id)}
				<button
					type="button"
					role="radio"
					aria-checked={sim.failAt === s.id}
					disabled={!canPick}
					onclick={() => (sim.failAt = s.id)}
					class="rounded px-3 py-1.5 font-mono text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50 {sim.failAt === s.id
						? 'bg-fault text-ink'
						: 'text-mute hover:text-bone'}"
				>
					{s.id}
				</button>
			{/each}
		</div>

		<div class="flex items-center gap-2">
			<button
				type="button"
				onclick={() => sim.start()}
				disabled={sim.busy || sim.phase === 'running'}
				class="flex cursor-pointer items-center gap-2 rounded-md bg-signal px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-bone disabled:cursor-not-allowed disabled:opacity-40"
			>
				<Play size={15} fill="currentColor" /> Iniciar
			</button>
			<button
				type="button"
				onclick={() => sim.stop()}
				disabled={sim.phase !== 'running'}
				class="flex cursor-pointer items-center gap-2 rounded-md border border-trace px-4 py-2.5 text-sm font-medium transition-colors hover:border-amber hover:text-amber disabled:cursor-not-allowed disabled:opacity-40"
			>
				<Power size={15} /> Enviar SIGTERM
			</button>
			<button
				type="button"
				onclick={() => sim.reset()}
				disabled={sim.busy || sim.phase === 'idle'}
				class="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2.5 text-sm text-mute transition-colors hover:text-bone disabled:cursor-not-allowed disabled:opacity-40"
				aria-label="Limpar"
			>
				<Eraser size={15} /> Limpar
			</button>
		</div>
	</div>

	<div class="mt-6 grid gap-5 lg:grid-cols-[1.1fr_1fr]">
		<div class="relative aspect-[5/4] w-full rounded-lg border border-trace bg-ink-2/50 sm:aspect-[16/10] lg:aspect-auto lg:min-h-[24rem]">
			<svg class="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
				{#each edges as e (e.from + e.to)}
					<path d={e.d} fill="none" stroke-width="2" vector-effect="non-scaling-stroke" class="transition-[stroke] duration-300 {edgeCls(e.from, e.to)}" />
				{/each}
			</svg>
			{#each SPECS as s (s.id)}
				{@const st = sim.states[s.id]}
				<button
					type="button"
					disabled={!canPick}
					aria-pressed={sim.failAt === s.id}
					aria-label="{s.id}: {STATE_TXT[st]}{sim.failAt === s.id ? ', vai falhar' : ''}"
					title={canPick ? 'Clique para falhar aqui' : undefined}
					onclick={() => (sim.failAt = sim.failAt === s.id ? null : s.id)}
					style="left: {s.x}%; top: {s.y}%"
					class="absolute flex w-[21%] -translate-x-1/2 -translate-y-1/2 flex-col items-start gap-1 rounded-md border px-1.5 py-2 text-left transition-colors duration-300 enabled:cursor-pointer sm:px-3 sm:py-2.5 {NODE_CLS[st]} {sim.failAt === s.id
						? 'outline-2 outline-offset-2 outline-dashed outline-fault/80'
						: ''}"
				>
					<span class="flex items-center gap-1.5">
						<span class="size-2 shrink-0 rounded-full {DOT_CLS[st]}"></span>
						<span class="font-mono text-[10px] font-medium sm:text-xs">{s.id}</span>
					</span>
					<span class="text-[10px] sm:text-xs">{STATE_TXT[st]}</span>
					{#if sim.failAt === s.id}
						<Bug size={14} class="absolute -top-2.5 -right-2 rounded-full bg-ink p-0.5 text-fault" />
					{/if}
				</button>
			{/each}
		</div>

		<div class="flex min-h-[22rem] flex-col overflow-hidden rounded-lg border border-trace bg-ink-2">
			<div class="flex items-center justify-between border-b border-trace px-4 py-2.5 font-mono text-xs text-mute">
				<span>node app.js</span>
				<span>{sim.log.length} linhas</span>
			</div>
			<div bind:this={logEl} role="log" aria-live="polite" class="h-[22rem] overflow-y-auto px-4 py-3 font-mono text-[0.72rem] leading-6 lg:h-auto lg:flex-1">
				{#if sim.log.length === 0}
					<p class="text-mute">Nada rodando. Escolha onde falhar e clique em Iniciar.</p>
				{/if}
				{#each sim.log as l (l.id)}
					<p class="grid grid-cols-[4.2rem_1fr] gap-2 {LOG_CLS[l.level]}">
						<span class="text-mute/70 tabular-nums">{l.t}</span>
						<span class="break-words">{l.text}</span>
					</p>
				{/each}
			</div>
		</div>
	</div>
</section>

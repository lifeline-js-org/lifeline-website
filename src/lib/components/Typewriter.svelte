<script lang="ts">
	import { onMount } from 'svelte';

	// Terminal que "digita" uma sequência de boot do LifeLine, linha a linha,
	// com o mesmo formato de log do prettyLogger do pacote.
	type Line = { text: string; tone: 'cmd' | 'dim' | 'ok' | 'warn' | 'err' | 'info' };

	const script: Line[] = [
		{ text: 'node app.js', tone: 'cmd' },
		{ text: '0.0ms  boot       iniciando 3 recursos', tone: 'info' },
		{ text: '1.2ms  config     ✓ init', tone: 'ok' },
		{ text: '8.7ms  postgres   ✓ init  (dependsOn: config)', tone: 'ok' },
		{ text: '9.1ms  http       ✓ init  (dependsOn: postgres)', tone: 'ok' },
		{ text: '9.4ms  running    ✓ aplicação no ar em 9.4ms', tone: 'ok' },
		{ text: '', tone: 'dim' },
		{ text: '^C', tone: 'dim' },
		{ text: '12.8ms shutdown   recebido SIGINT', tone: 'warn' },
		{ text: '13.0ms http       ✓ close', tone: 'ok' },
		{ text: '13.4ms postgres   ✓ close', tone: 'ok' },
		{ text: '13.6ms config     ✓ close', tone: 'ok' },
		{ text: '13.9ms stopped    ✓ encerrado em ordem inversa', tone: 'ok' }
	];

	const TONE: Record<Line['tone'], string> = {
		cmd: 'text-bone',
		dim: 'text-mute',
		info: 'text-cursor',
		ok: 'text-signal',
		warn: 'text-amber',
		err: 'text-fault'
	};

	let shown = $state<Line[]>([]);
	let typing = $state(''); // texto parcial da linha atual
	let reduced = false;

	// velocidades (ms) — digitamos caractere a caractere só na linha do comando
	const CHAR_MS = 42;
	const LINE_MS = 340;

	onMount(() => {
		reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced) {
			shown = script;
			return;
		}

		let cancelled = false;
		const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

		(async () => {
			// pequena espera antes de começar
			await wait(500);
			for (const line of script) {
				if (cancelled) return;
				if (line.tone === 'cmd') {
					// digita o comando caractere a caractere
					for (const ch of line.text) {
						if (cancelled) return;
						typing += ch;
						await wait(CHAR_MS);
					}
					await wait(LINE_MS);
					shown = [...shown, line];
					typing = '';
				} else {
					shown = [...shown, line];
					await wait(LINE_MS);
				}
			}
		})();

		return () => {
			cancelled = true;
		};
	});
</script>

<div class="overflow-hidden rounded-xl border border-trace bg-ink-2">
	<div class="flex items-center gap-1.5 border-b border-trace bg-ink-3/60 px-4 py-2.5" aria-hidden="true">
		<span class="size-2.5 rounded-full bg-fault/80"></span>
		<span class="size-2.5 rounded-full bg-amber/80"></span>
		<span class="size-2.5 rounded-full bg-signal/80"></span>
		<span class="ml-2 font-mono text-[0.72rem] text-mute">~/app</span>
	</div>

	<div class="scroll-thin max-h-72 overflow-y-auto px-5 py-4 font-mono text-[0.78rem] leading-[1.85]">
		{#each shown as line, i (i)}
			<div class="{TONE[line.tone]} whitespace-pre-wrap">
				{#if line.tone === 'cmd'}<span class="text-signal select-none">$ </span>{/if}{line.text}
			</div>
		{/each}
		{#if typing}
			<div class="text-bone"><span class="text-signal select-none">$ </span>{typing}<span class="caret"></span></div>
		{/if}
		{#if !typing && shown.length > 0 && shown.length < script.length}
			<div class="text-bone"><span class="caret"></span></div>
		{/if}
	</div>
</div>

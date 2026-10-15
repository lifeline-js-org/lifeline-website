<script lang="ts">
	import { onMount } from 'svelte';
	import { sim, SPECS, type Phase } from '#lib/sim.svelte.ts';

	let canvas: HTMLCanvasElement;
	let box: HTMLDivElement;

	const LABEL: Record<Phase, string> = {
		idle: 'parada',
		starting: 'subindo',
		running: 'no ar',
		'rolling-back': 'revertendo',
		failed: 'falhou e limpou tudo',
		stopping: 'encerrando',
		stopped: 'encerrada'
	};

	const COLOR: Record<Phase, string> = {
		idle: '#3a3a3a',
		starting: '#9df3cd',
		running: '#35e6a0',
		'rolling-back': '#f5b94a',
		failed: '#ff5f49',
		stopping: '#f5b94a',
		stopped: '#8d8d8a'
	};

	let reducedMotion = false;
	let redraw: () => void = () => {};

	onMount(() => {
		reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
		const ctx = canvas.getContext('2d')!;
		let w = 0,
			h = 0,
			ys: number[] = [],
			cs: string[] = [];
		let beatPhase = 999,
			beatAmp = 1,
			since = 0,
			lastSeq = sim.pulse.seq;
		const queue: number[] = [];

		const g = (p: number, c: number, s: number) => Math.exp(-((p - c) ** 2) / (2 * s * s));
		const wave = (p: number) =>
			0.12 * g(p, 12, 6) - 0.14 * g(p, 26, 1.8) + g(p, 30, 2.4) - 0.28 * g(p, 34, 2) + 0.22 * g(p, 56, 8);

		function sample() {
			if (sim.pulse.seq !== lastSeq) {
				lastSeq = sim.pulse.seq;
				queue.push(sim.pulse.kind === 'fault' ? 1.7 : sim.pulse.kind === 'down' ? 0.65 : 1);
			}
			if (beatPhase >= 90) {
				if (queue.length) {
					beatAmp = queue.shift()!;
					beatPhase = 0;
					since = 0;
				} else if (sim.phase === 'running' && since >= 150) {
					beatAmp = 0.8;
					beatPhase = 0;
					since = 0;
				}
			}
			since++;
			const v = beatPhase < 90 ? beatAmp * wave(beatPhase) : 0;
			beatPhase++;
			ys.push(v);
			cs.push(COLOR[sim.phase]);
			if (ys.length > w) {
				ys.shift();
				cs.shift();
			}
		}

		function draw() {
			ctx.clearRect(0, 0, w, h);
			ctx.lineWidth = 1;
			ctx.strokeStyle = 'rgba(255,255,255,.05)';
			ctx.beginPath();
			for (let x = 0; x < w; x += 48) {
				ctx.moveTo(x + 0.5, 0);
				ctx.lineTo(x + 0.5, h);
			}
			for (let y = h * 0.18; y < h; y += h * 0.3) {
				ctx.moveTo(0, y);
				ctx.lineTo(w, y);
			}
			ctx.stroke();

			const base = h * 0.7,
				amp = h * 0.52,
				off = w - ys.length;
			ctx.lineWidth = 2.5;
			ctx.lineJoin = 'round';
			ctx.lineCap = 'round';
			let i = 0;
			while (i < ys.length) {
				let j = i;
				while (j + 1 < ys.length && cs[j + 1] === cs[i]) j++;
				ctx.beginPath();
				ctx.strokeStyle = cs[i];
				ctx.shadowColor = cs[i];
				ctx.shadowBlur = 10;
				for (let k = Math.max(0, i - 1); k <= j; k++) {
					const x = off + k,
						y = base - ys[k] * amp;
					k === Math.max(0, i - 1) ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
				}
				ctx.stroke();
				i = j + 1;
			}
			ctx.shadowBlur = 0;
			if (ys.length) {
				ctx.fillStyle = cs[cs.length - 1];
				ctx.beginPath();
				ctx.arc(w - 4, base - ys[ys.length - 1] * amp, 4.5, 0, Math.PI * 2);
				ctx.fill();
			}
		}

		function fillStatic() {
			ys = [];
			cs = [];
			beatPhase = 999;
			since = 150;
			for (let i = 0; i < w; i++) sample();
			draw();
		}
		redraw = () => {
			if (reducedMotion) fillStatic();
		};

		function resize() {
			const r = box.getBoundingClientRect();
			const dpr = Math.min(devicePixelRatio || 1, 2);
			w = Math.floor(r.width);
			h = Math.floor(r.height);
			canvas.width = w * dpr;
			canvas.height = h * dpr;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			ys = new Array(w).fill(0);
			cs = new Array(w).fill(COLOR[sim.phase]);
			if (reducedMotion) fillStatic();
		}

		const ro = new ResizeObserver(resize);
		ro.observe(box);
		resize();

		let raf = 0,
			last = performance.now();
		function frame(now: number) {
			const n = Math.max(1, Math.round(((now - last) / 16.67) * 2));
			last = now;
			for (let i = 0; i < Math.min(n, 12); i++) sample();
			draw();
			raf = requestAnimationFrame(frame);
		}
		if (!reducedMotion) raf = requestAnimationFrame(frame);

		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
		};
	});

	$effect(() => {
		sim.phase;
		sim.pulse.seq;
		redraw();
	});
</script>

<section class="sticky top-14 z-30 border-y border-trace bg-ink/90 backdrop-blur-md" aria-label="Pulso da aplicação">
	<div class="relative mx-auto h-24 w-full max-w-[1600px] sm:h-28" bind:this={box}>
		<canvas bind:this={canvas} class="absolute inset-0 h-full w-full" aria-hidden="true"></canvas>
		<div class="pointer-events-none absolute top-3 left-5 flex flex-wrap items-baseline gap-x-4 gap-y-1 sm:left-8">
			<p class="font-mono text-sm font-medium" style="color: {COLOR[sim.phase]}" aria-live="polite">
				{LABEL[sim.phase]}
			</p>
			<p class="font-mono text-xs text-mute tabular-nums">{sim.alive}/{SPECS.length} recursos vivos</p>
		</div>
	</div>
</section>

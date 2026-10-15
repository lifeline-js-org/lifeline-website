<script lang="ts">
	import { Copy, Check } from '@lucide/svelte';
	import { SITE } from '#lib/site.ts';

	// Cada gerenciador tem um comando e um destaque de cor própria para o nome do PM.
	const managers = [
		{ id: 'npm', label: 'npm', cmd: 'npm install lifeline.js', tint: 'text-fault' },
		{ id: 'pnpm', label: 'pnpm', cmd: 'pnpm add lifeline.js', tint: 'text-amber' },
		{ id: 'yarn', label: 'yarn', cmd: 'yarn add lifeline.js', tint: 'text-bone' },
		{ id: 'bun', label: 'bun', cmd: 'bun add lifeline.js', tint: 'text-signal' }
	];

	let active = $state('npm');
	let copied = $state(false);

	const current = $derived(managers.find((m) => m.id === active) ?? managers[0]);
	const words = $derived(current.cmd.split(' '));

	async function copy() {
		try {
			await navigator.clipboard.writeText(current.cmd);
			copied = true;
			setTimeout(() => (copied = false), 1800);
		} catch {
			/* clipboard indisponível: o texto continua selecionável */
		}
	}
</script>

<div class="overflow-hidden rounded-xl border border-trace bg-ink-2">
	<!-- barra de abas -->
	<div class="flex items-stretch border-b border-trace bg-ink-3/60">
		<div class="flex items-center gap-1.5 px-4" aria-hidden="true">
			<span class="size-2.5 rounded-full bg-fault/80"></span>
			<span class="size-2.5 rounded-full bg-amber/80"></span>
			<span class="size-2.5 rounded-full bg-signal/80"></span>
		</div>
		<div class="flex overflow-x-auto" role="tablist" aria-label="Gerenciador de pacotes">
			{#each managers as m (m.id)}
				<button
					type="button"
					role="tab"
					aria-selected={active === m.id}
					onclick={() => (active = m.id)}
					class="cursor-pointer border-b-2 px-4 py-2.5 font-mono text-[0.78rem] whitespace-nowrap transition-colors {active ===
					m.id
						? 'border-signal text-bone'
						: 'border-transparent text-mute hover:text-bone/80'}"
				>
					{m.label}
				</button>
			{/each}
		</div>
		<button
			type="button"
			onclick={copy}
			class="ml-auto flex w-12 shrink-0 cursor-pointer items-center justify-center border-l border-trace text-mute transition-colors hover:bg-trace/50 hover:text-signal"
			aria-label={copied ? 'Copiado' : 'Copiar comando de instalação'}
		>
			{#if copied}<Check size={16} class="text-signal" />{:else}<Copy size={16} />{/if}
		</button>
	</div>

	<!-- comando -->
	<div class="px-5 py-4">
		<code class="font-mono text-[0.9rem] whitespace-nowrap text-bone select-all">
			<span class="text-signal select-none">{'$ '}</span><span class={current.tint}>{words[0]}</span
			>{#if words.length > 1}{' ' + words.slice(1).join(' ')}{/if}
		</code>
	</div>
</div>
<span class="sr-only" aria-live="polite">{copied ? 'Comando copiado' : ''}</span>
<p class="mt-3 text-sm text-mute">
	Requer <code class="font-mono text-[0.85em] text-bone/80">{SITE.engine}</code>. ESM-only — sem CommonJS.
</p>

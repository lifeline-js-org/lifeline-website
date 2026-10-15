<script lang="ts">
	import { Copy, Check } from '@lucide/svelte';
	let { cmd }: { cmd: string } = $props();
	let copied = $state(false);
	async function copy() {
		try {
			await navigator.clipboard.writeText(cmd);
			copied = true;
			setTimeout(() => (copied = false), 1800);
		} catch {
			/* clipboard indisponível: o texto continua selecionável */
		}
	}
</script>

<div class="inline-flex max-w-full items-stretch overflow-hidden rounded-md border border-trace bg-ink-2">
	<code class="overflow-x-auto px-4 py-3 font-mono text-[0.8rem] whitespace-nowrap text-bone select-all">
		<span class="text-mute select-none">$ </span>{cmd}
	</code>
	<button
		type="button"
		onclick={copy}
		class="flex w-12 shrink-0 cursor-pointer items-center justify-center border-l border-trace text-mute transition-colors hover:bg-trace/50 hover:text-signal"
		aria-label={copied ? 'Copiado' : 'Copiar comando de instalação'}
	>
		{#if copied}<Check size={16} class="text-signal" />{:else}<Copy size={16} />{/if}
	</button>
</div>
<span class="sr-only" aria-live="polite">{copied ? 'Comando copiado' : ''}</span>

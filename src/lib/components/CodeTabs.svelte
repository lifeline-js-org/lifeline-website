<script lang="ts">
	/** Um painel de código já destacado. */
	export interface CodePanel {
		label: string;
		html: string;
	}

	let {
		panels,
		label
	}: {
		/** Painéis na ordem de exibição; o primeiro é o padrão. */
		panels: readonly CodePanel[];
		/** Nome do grupo, usado em aria-label e ids. */
		label: string;
	} = $props();

	let active = $state(0);
</script>

<div class="flex flex-col">
	<div role="tablist" aria-label={label} class="flex gap-1 border-b border-trace px-3 pt-2.5">
		{#each panels as panel, i (panel.label)}
			<button
				type="button"
				role="tab"
				aria-selected={active === i}
				aria-controls="tabpanel-{label}-{i}"
				id="tab-{label}-{i}"
				onclick={() => (active = i)}
				class="cursor-pointer rounded-t-md px-3 pb-2 font-mono text-[0.68rem] tracking-wide transition-colors {active === i
					? 'border-b-2 border-signal text-bone'
					: 'border-b-2 border-transparent text-mute hover:text-bone/80'}"
			>
				{panel.label}
			</button>
		{/each}
	</div>
	{#each panels as panel, i (panel.label)}
		<div
			role="tabpanel"
			id="tabpanel-{label}-{i}"
			aria-labelledby="tab-{label}-{i}"
			hidden={active !== i}
			class="overflow-x-auto px-4 py-3.5"
		>
			{@html panel.html}
		</div>
	{/each}
</div>

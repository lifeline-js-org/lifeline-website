<script lang="ts">
	// Barra rolante estilo "ticker" — frases do projeto com separadores pontilhados.
	// Duplicamos a lista uma vez para o loop de translateX(-50%) ficar contínuo.
	const items = [
		'Zero dependências',
		'ESM-only',
		'Rollback em ordem inversa',
		'Tipos incluídos',
		'Node 24+',
		'Logger estruturado',
		'Grafo de dependências validado',
		'Estados terminais explícitos',
		'Concorrência sem corrida',
		'sigterm & sigint'
	];
	const doubled = [...items, ...items];
</script>

<div class="ticker overflow-hidden border-y border-trace bg-ink-2/60 py-2.5" aria-hidden="true">
	<div class="ticker-track items-center">
		{#each doubled as item, i (i)}
			<span class="flex shrink-0 items-center">
				<span class="px-5 text-[0.82rem] font-semibold tracking-wide whitespace-nowrap text-bone/70">{item}</span>
				<span class="size-1.5 shrink-0 rounded-full bg-signal/70"></span>
			</span>
		{/each}
	</div>
</div>

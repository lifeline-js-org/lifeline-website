<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<a
	href="#conteudo"
	class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded focus:bg-signal focus:px-3 focus:py-2 focus:text-ink"
>
	Pular para o conteúdo
</a>
{@render children()}

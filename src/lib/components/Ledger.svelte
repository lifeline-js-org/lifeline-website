<script lang="ts">
	const rows = [
		{
			sig: 'needs: [db]',
			title: 'Declare o que cada recurso precisa',
			body: 'A ordem de início sai do grafo. Recursos independentes sobem em paralelo, e ciclos são recusados antes de qualquer coisa iniciar.'
		},
		{
			sig: 'stop: (db) => db.end()',
			title: 'Cada recurso sabe se encerrar',
			body: 'Em falha ou sinal, apenas o que subiu é encerrado, com dependentes primeiro. Quem nunca iniciou não recebe chamada de stop.'
		},
		{
			sig: 'retry: 3, timeout: 5_000',
			title: 'Tentativas e prazo por recurso',
			body: 'O banco demorou para aceitar conexão? Tente de novo com backoff. Passou do prazo, conta como falha e dispara o rollback.'
		},
		{
			sig: 'SIGINT · SIGTERM',
			title: 'Encerramento ordenado por sinal',
			body: 'Ctrl-C e o SIGTERM do orquestrador chamam app.stop(). Um segundo sinal força a saída se algum recurso travar.'
		},
		{
			sig: 'LifelineStartError',
			title: 'Falha com nome e causa',
			body: 'Quando o boot não completa, start() rejeita apontando o recurso culpado, o erro original e o resultado da limpeza de cada um dos outros.'
		}
	];
</script>

<section id="api" class="mx-auto max-w-6xl px-5 py-24">
	<div class="grid gap-12 lg:grid-cols-[0.8fr_1.4fr]">
		<div class="lg:sticky lg:top-24 lg:self-start">
			<h2 class="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">Cinco ideias, uma API pequena.</h2>
			<p class="mt-4 max-w-md text-lg leading-relaxed text-mute">
				Sem framework, sem decorators, sem arquivo de configuração. Só o que o seu processo precisa para subir e cair direito.
			</p>
		</div>
		<dl class="divide-y divide-trace border-y border-trace">
			{#each rows as r (r.sig)}
				<div class="grid gap-3 py-7 sm:grid-cols-[13.5rem_1fr] sm:gap-8">
					<dt class="font-mono text-[0.78rem] leading-relaxed break-words text-signal">{r.sig}</dt>
					<dd>
						<p class="text-lg font-medium">{r.title}</p>
						<p class="mt-1.5 max-w-xl leading-relaxed text-mute">{r.body}</p>
					</dd>
				</div>
			{/each}
		</dl>
	</div>
</section>

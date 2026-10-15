<script lang="ts">
	import { Network, RotateCcw, Power, ShieldAlert, Workflow, Timer } from '@lucide/svelte';

	const features = [
		{
			icon: Network,
			title: 'Grafo de dependências',
			body: 'dependsOn?: readonly string[] define a ordem topológica. Ciclo, dependência inexistente e duplicata falham antes de qualquer init().'
		},
		{
			icon: RotateCcw,
			title: 'Rollback em ordem inversa',
			body: 'Um init() falhou? Os recursos já inicializados são fechados na ordem inversa e start() rejeita com a causa raiz.'
		},
		{
			icon: Power,
			title: 'Encerramento determinístico',
			body: 'shutdown() fecha na ordem inversa da inicialização efetiva. Falhas de close() não interrompem a limpeza do resto.'
		},
		{
			icon: ShieldAlert,
			title: 'Contrato de erros explícito',
			body: 'Rollback limpo entrega o erro original como está. Sujo entrega AggregateError com um CleanupError por recurso.'
		},
		{
			icon: Workflow,
			title: 'Máquina de estados visível',
			body: 'created → starting → running → stopping → stopped, com failed terminal. O getter state expõe tudo; violações lançam síncrono.'
		},
		{
			icon: Timer,
			title: 'Concorrência sem corrida',
			body: 'start() e shutdown() guardam suas Promises. Chamadas concorrentes e reentrantes compartilham a mesma operação.'
		}
	];
</script>

<section id="recursos" class="border-b border-trace">
	<div class="mx-auto max-w-6xl px-5 py-20 md:py-24">
		<h2 class="max-w-2xl text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
			Seis comportamentos, nenhum framework.
		</h2>
		<p class="mt-4 max-w-2xl text-lg leading-relaxed text-mute">
			Sem decorators, sem arquivo de configuração, sem container de injeção. Só o que o processo precisa para subir e cair direito.
		</p>

		<div class="mt-12 grid gap-px overflow-hidden rounded-lg border border-trace bg-trace sm:grid-cols-2 lg:grid-cols-3">
			{#each features as f (f.title)}
				<div class="bg-ink p-6 transition-colors hover:bg-ink-2">
					<f.icon size={20} class="text-signal" strokeWidth={1.6} />
					<h3 class="mt-4 font-semibold">{f.title}</h3>
					<p class="mt-2 text-sm leading-relaxed text-mute">{f.body}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

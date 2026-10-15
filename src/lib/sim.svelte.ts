export type NodeState = 'idle' | 'starting' | 'up' | 'failed' | 'stopping' | 'down' | 'skipped';
export type Phase = 'idle' | 'starting' | 'running' | 'rolling-back' | 'failed' | 'stopping' | 'stopped';
export type Level = 'info' | 'ok' | 'warn' | 'error' | 'dim';
export type PulseKind = 'up' | 'down' | 'fault';

export interface Spec {
	id: string;
	needs: string[];
	startMs: number;
	stopMs: number;
	error: string;
	x: number;
	y: number;
}
export interface LogLine {
	id: number;
	t: string;
	level: Level;
	text: string;
}

export const SPECS: Spec[] = [
	{ id: 'config', needs: [], startMs: 350, stopMs: 150, error: 'ENOENT .env.production', x: 11, y: 50 },
	{ id: 'postgres', needs: ['config'], startMs: 1100, stopMs: 650, error: 'ECONNREFUSED 127.0.0.1:5432', x: 36, y: 24 },
	{ id: 'redis', needs: ['config'], startMs: 600, stopMs: 350, error: 'ETIMEDOUT redis:6379', x: 36, y: 76 },
	{ id: 'queue', needs: ['redis'], startMs: 750, stopMs: 500, error: 'NOAUTH authentication required', x: 64, y: 76 },
	{ id: 'http', needs: ['postgres', 'queue'], startMs: 500, stopMs: 700, error: 'EADDRINUSE :::3000', x: 89, y: 50 }
];

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const initial = () => Object.fromEntries(SPECS.map((s) => [s.id, 'idle'])) as Record<string, NodeState>;

class Sim {
	states = $state<Record<string, NodeState>>(initial());
	phase = $state<Phase>('idle');
	failAt = $state<string | null>(null);
	log = $state<LogLine[]>([]);
	pulse = $state<{ seq: number; kind: PulseKind }>({ seq: 0, kind: 'up' });

	#token = 0;
	#t0 = 0;
	#n = 0;

	get busy() {
		return this.phase === 'starting' || this.phase === 'rolling-back' || this.phase === 'stopping';
	}
	get alive() {
		return SPECS.filter((s) => this.states[s.id] === 'up').length;
	}

	#say(level: Level, text: string) {
		const t = ((performance.now() - this.#t0) / 1000).toFixed(2);
		this.log.push({ id: this.#n++, t: `+${t}s`, level, text });
	}
	#beat(kind: PulseKind) {
		this.pulse = { seq: this.pulse.seq + 1, kind };
	}
	#spec(id: string) {
		return SPECS.find((s) => s.id === id)!;
	}

	reset() {
		this.#token++;
		this.states = initial();
		this.phase = 'idle';
		this.log = [];
	}

	async start() {
		if (this.busy || this.phase === 'running') return;
		this.reset();
		const token = this.#token;
		this.#t0 = performance.now();
		this.phase = 'starting';
		this.#say('info', 'app.start()');

		const started: string[] = [];
		let failed: { id: string; error: string } | null = null;
		let pending = 0;
		let done!: () => void;
		const finished = new Promise<void>((r) => (done = r));

		const launch = (id: string) => {
			const spec = this.#spec(id);
			pending++;
			this.states[id] = 'starting';
			const needs = spec.needs.length ? ` (precisa de ${spec.needs.join(', ')})` : '';
			this.#say('dim', `${id} iniciando${needs}`);
			const began = performance.now();
			sleep(spec.startMs).then(() => {
				if (token !== this.#token) return;
				const secs = ((performance.now() - began) / 1000).toFixed(2);
				if (this.failAt === id) {
					this.states[id] = 'failed';
					failed ??= { id, error: spec.error };
					this.#say('error', `${id} falhou: ${spec.error}`);
					this.#beat('fault');
				} else {
					this.states[id] = 'up';
					started.push(id);
					this.#say('ok', `${id} no ar · ${secs}s`);
					this.#beat('up');
				}
				pending--;
				next();
			});
		};
		const next = () => {
			if (!failed) {
				for (const s of SPECS) {
					if (this.states[s.id] === 'idle' && s.needs.every((n) => this.states[n] === 'up')) launch(s.id);
				}
			}
			if (pending === 0) done();
		};
		next();
		await finished;
		if (token !== this.#token) return;

		if (failed) {
			const culprit = failed as { id: string; error: string };
			const skipped = SPECS.filter((s) => this.states[s.id] === 'idle').map((s) => s.id);
			for (const id of skipped) this.states[id] = 'skipped';
			this.phase = 'rolling-back';
			if (skipped.length) this.#say('warn', `${skipped.join(', ')} ${skipped.length > 1 ? 'ignorados' : 'ignorado'}: ${skipped.length > 1 ? 'dependem' : 'depende'} de ${culprit.id}`);
			this.#say('warn', started.length ? `rollback: encerrando ${started.length} em ordem inversa` : 'rollback: nada subiu, nada a limpar');
			await this.#teardown(token);
			if (token !== this.#token) return;
			this.phase = 'failed';
			this.#say('error', `LifelineStartError: ${culprit.id} falhou · ${started.length} encerrados · 0 vazaram`);
			this.#say('dim', 'start() rejeitou. O processo pode sair com código 1.');
		} else {
			this.phase = 'running';
			this.#say('ok', `pronta · ${SPECS.length} recursos em ${((performance.now() - this.#t0) / 1000).toFixed(2)}s`);
		}
	}

	async stop() {
		if (this.phase !== 'running') return;
		const token = this.#token;
		this.phase = 'stopping';
		this.#say('info', 'SIGTERM recebido · app.stop()');
		await this.#teardown(token);
		if (token !== this.#token) return;
		this.phase = 'stopped';
		this.#say('ok', 'encerrada · 0 recursos vazados');
	}

	/** Encerra quem está 'up', dependentes primeiro; independentes em paralelo. */
	#teardown(token: number) {
		return new Promise<void>((resolve) => {
			let pending = 0;
			const next = () => {
				if (token !== this.#token) return resolve();
				for (const s of SPECS) {
					if (this.states[s.id] !== 'up') continue;
					const blocked = SPECS.some((d) => d.needs.includes(s.id) && ['up', 'stopping'].includes(this.states[d.id]));
					if (blocked) continue;
					pending++;
					this.states[s.id] = 'stopping';
					this.#say('dim', `${s.id} encerrando`);
					sleep(s.stopMs).then(() => {
						if (token !== this.#token) return resolve();
						this.states[s.id] = 'down';
						this.#say('warn', `${s.id} encerrado · ${(s.stopMs / 1000).toFixed(2)}s`);
						this.#beat('down');
						pending--;
						next();
					});
				}
				if (pending === 0) resolve();
			};
			next();
		});
	}
}

export const sim = new Sim();

export const SITE = {
	name: 'LifeLine.js',
	/** Domínio canônico — usado em canonical, Open Graph e sitemap. */
	url: 'https://lifeline.discloud.app',
	tagline: 'Inicie, conecte e encerre com segurança.',
	description:
		'LifeLine.js coordena a inicialização, as dependências e o encerramento dos recursos de aplicações Node.js, com rollback em ordem inversa e um contrato de erros explícito.',
	install: 'npm install lifeline.js',
	npm: 'https://www.npmjs.com/package/lifeline.js',
	github: 'https://github.com/lifeline-js-org/lifeline-js',
	repo: 'lifeline-js-org/lifeline-js',
	version: '0.1.2',
	engine: 'Node.js 24+ · ESM',
	locale: 'pt_BR',
	author: 'lifeline-js',
	keywords: [
		'lifeline',
		'lifecycle',
		'gerenciamento de ciclo de vida',
		'node.js',
		'bootstrap',
		'inicialização',
		'rollback',
		'graceful shutdown',
		'dependências',
		'recurso',
		'sigterm',
		'sigint',
		'typescript',
		'esm'
	]
} as const;

/** Dimensões do banner social (static/og.png). */
export const OG_IMAGE = {
	path: '/og.png',
	width: 2400,
	height: 1260,
	alt: 'LifeLine.js — Inicie, conecte e encerre com segurança.'
} as const;

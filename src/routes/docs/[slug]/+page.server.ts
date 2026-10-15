import { error } from '@sveltejs/kit';
import { renderDoc, extractToc, docBySlug, type DocMeta } from '#lib/docs.ts';
import type { EntryGenerator, PageServerLoad } from './$types.js';

// Imports explícitos com ?raw: funcionam no prerender estático
// (import.meta.glob não está disponível na saída do adapter-static).
type DocLoader = () => Promise<string>;

const modules: Record<string, DocLoader> = {
	introducao: () => import('#lib/docs/introducao.md?raw').then((m) => m.default),
	instalacao: () => import('#lib/docs/instalacao.md?raw').then((m) => m.default),
	comecando: () => import('#lib/docs/comecando.md?raw').then((m) => m.default),
	recursos: () => import('#lib/docs/recursos.md?raw').then((m) => m.default),
	dependencias: () => import('#lib/docs/dependencias.md?raw').then((m) => m.default),
	estados: () => import('#lib/docs/estados.md?raw').then((m) => m.default),
	erros: () => import('#lib/docs/erros.md?raw').then((m) => m.default),
	encerramento: () => import('#lib/docs/encerramento.md?raw').then((m) => m.default),
	logs: () => import('#lib/docs/logs.md?raw').then((m) => m.default),
	typescript: () => import('#lib/docs/typescript.md?raw').then((m) => m.default),
	limitacoes: () => import('#lib/docs/limitacoes.md?raw').then((m) => m.default)
};

export const entries: EntryGenerator = () => {
	return Object.keys(modules).map((slug) => ({ slug }));
};

export const load: PageServerLoad = async ({ params }) => {
	const meta: DocMeta | undefined = docBySlug(params.slug);
	const loader = modules[params.slug];

	if (!meta || !loader) {
		throw error(404, 'Página não encontrada');
	}

	const source = await loader();
	const html = await renderDoc(source);

	return {
		meta,
		html,
		toc: extractToc(html)
	};
};

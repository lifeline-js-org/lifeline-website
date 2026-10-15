import { error } from '@sveltejs/kit';
import { renderDoc, extractToc, docBySlug, type DocMeta } from '#lib/docs.ts';
import { DOCS_RAW } from '#lib/docs/content.ts';
import type { EntryGenerator, PageServerLoad } from './$types.js';

// O conteúdo dos .md é embutido em content.ts (gerado por scripts/generate-docs.mjs,
// roda antes do vite build). Motivo: o builder da Discloud exclui arquivos .md do
// contexto de build — importá-los em tempo de build faria o prerender falhar com 404.

export const entries: EntryGenerator = () => {
	return Object.keys(DOCS_RAW).map((slug) => ({ slug }));
};

export const load: PageServerLoad = async ({ params }) => {
	const meta: DocMeta | undefined = docBySlug(params.slug);
	const source = DOCS_RAW[params.slug];

	if (!meta || !source) {
		throw error(404, 'Página não encontrada');
	}

	const html = await renderDoc(source);

	return {
		meta,
		html,
		toc: extractToc(html)
	};
};

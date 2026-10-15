import { error } from '@sveltejs/kit';
import { renderDoc, extractToc, docBySlug, type DocMeta } from '#lib/docs.ts';
import type { EntryGenerator, PageServerLoad } from './$types.js';

// import.meta.glob: o Vite resolve estaticamente em tempo de build,
// sem depender do campo "imports" (#lib) nem de consultas ?raw dinâmicas.
const docs = import.meta.glob<string>('/src/lib/docs/*.md', {
	query: '?raw',
	import: 'default'
});

const modules: Record<string, () => Promise<string>> = Object.fromEntries(
	Object.entries(docs).map(([path, load]) => [path.split('/').pop()!.replace(/\.md$/, ''), load])
);

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

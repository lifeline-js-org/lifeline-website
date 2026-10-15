import { Marked, type Token, type Tokens } from 'marked';
import { codeToHtml } from 'shiki';

/** Ícones lucide usados por seção da documentação. */
export type DocIcon = 'rocket' | 'layers' | 'book';

/** Slug e título de cada página, na ordem da sidebar. */
export interface DocMeta {
	slug: string;
	title: string;
	section: string;
	summary: string;
}

/** Uma seção da sidebar, com ícone e páginas. */
export interface DocSection {
	name: string;
	icon: DocIcon;
	docs: DocMeta[];
}

export const SECTIONS: Array<{ name: string; icon: DocIcon }> = [
	{ name: 'Começando', icon: 'rocket' },
	{ name: 'Conceitos', icon: 'layers' },
	{ name: 'Referência', icon: 'book' }
];

export const DOCS: DocMeta[] = [
	{ slug: 'introducao', title: 'Introdução', section: 'Começando', summary: 'O que é, por que existe e o primeiro boot.' },
	{ slug: 'instalacao', title: 'Instalação', section: 'Começando', summary: 'npm install, requisitos de Node e ESM-only.' },
	{ slug: 'comecando', title: 'Primeiro app', section: 'Começando', summary: 'Registre recursos, inicie e encerre.' },
	{ slug: 'recursos', title: 'Contrato do recurso', section: 'Conceitos', summary: 'name, init, close e dependsOn.' },
	{ slug: 'dependencias', title: 'Dependências', section: 'Conceitos', summary: 'Ordem topológica e validação do grafo.' },
	{ slug: 'estados', title: 'Máquina de estados', section: 'Conceitos', summary: 'Os seis estados e as transições.' },
	{ slug: 'erros', title: 'Erros e rollback', section: 'Conceitos', summary: 'Contrato explícito de falhas e limpeza.' },
	{ slug: 'encerramento', title: 'Encerramento e sinais', section: 'Conceitos', summary: 'shutdown(), SIGINT, SIGTERM.' },
	{ slug: 'logs', title: 'Logs estruturados', section: 'Conceitos', summary: 'Eventos do ciclo de vida e prettyLogger.' },
	{ slug: 'typescript', title: 'TypeScript', section: 'Referência', summary: 'Tipos exportados e uso bem tipado.' },
	{ slug: 'limitacoes', title: 'Limitações v1', section: 'Referência', summary: 'O que ainda não faz.' }
];

/** Agrupa os docs por seção, preservando a ordem de SECTIONS. */
export function sections(): DocSection[] {
	return SECTIONS.map((s) => ({ ...s, docs: DOCS.filter((d) => d.section === s.name) })).filter((s) => s.docs.length > 0);
}

/** Slug de âncora para o nome de uma seção (ex.: "Começando" → "comecando"). */
export function sectionSlug(name: string): string {
	return name
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-');
}

/**
 * Cards de destaque exibidos no topo da página inicial da documentação,
 * no mesmo espírito do "Welcome" do bun.com/docs.
 */
export interface DocCard {
	slug: string;
	title: string;
	body: string;
	cta: string;
	icon: DocIcon;
}

export const FEATURED: DocCard[] = [
	{
		slug: 'comecando',
		title: 'Primeiro app',
		body: 'Registre um recurso, inicie o gerenciador e encerre em ordem inversa em menos de vinte linhas.',
		cta: 'Começar com register',
		icon: 'rocket'
	},
	{
		slug: 'dependencias',
		title: 'Grafo de dependências',
		body: 'dependsOn resolve a ordem topológica. Ciclos e dependências ausentes falham antes de qualquer init().',
		cta: 'Entender dependsOn',
		icon: 'layers'
	},
	{
		slug: 'erros',
		title: 'Rollback e erros',
		body: 'Um init() falhou? O que subiu fecha em ordem inversa e start() rejeita com a causa raiz em cause.',
		cta: 'Ver o contrato de erros',
		icon: 'book'
	},
	{
		slug: 'typescript',
		title: 'TypeScript',
		body: 'Resource, LifeLineState e CleanupError exportados com tipos completos, via entry principal ou /core.',
		cta: 'Ver os tipos',
		icon: 'layers'
	}
];

const slugger = (text: string) =>
	text
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-');

const marked = new Marked({ gfm: true, breaks: false });

marked.use({
	renderer: {
		heading(this: { parser: { parseInline: (tokens: Token[]) => string } }, { tokens, depth }: Tokens.Heading): string {
			// renderiza o inline (code, strong etc.) em vez do raw do markdown;
			// em marked, `this` neste renderer expõe a parser via this.parser.
			const inner = this.parser.parseInline(tokens);
			const text = inner.replace(/<[^>]+>/g, '');
			const id = slugger(text);
			// h2/h3 ganham âncora clicável, como no bun.com/docs
			const anchor = depth <= 3 ? `<a class="anchor" href="#${id}" aria-label="Link para esta seção">#</a>` : '';
			return `<h${depth} id="${id}">${inner}${anchor}</h${depth}>\n`;
		}
	}
});

const SHIKI_LANGS = new Set(['js', 'ts', 'bash', 'json', 'txt']);
const FENCE = /^```(\w+)[^\n]*\n([\s\S]*?)^```/gm;

/**
 * Renderiza Markdown para HTML, destacando os blocos ``` com shiki.
 * O marked é síncrono; a destaqueção acontece antes, via placeholder.
 */
export async function renderDoc(markdown: string): Promise<string> {
	// O layout já renderiza o título (meta.title) como <h1>, então removemos
	// o H1 de topo do markdown para evitar duplicação.
	const source = markdown.replace(/^#\s+[^\n]+\n+/, '');

	const blocks: Array<{ lang: string; code: string }> = [];
	const prepared = source.replace(FENCE, (_match, lang: string | undefined, code: string) => {
		const language = lang && SHIKI_LANGS.has(lang) ? lang : 'txt';
		blocks.push({ lang: language, code });
		return `\n@@CODE${blocks.length - 1}@@\n`;
	});

	let html = String(await marked.parse(prepared));

	for (let i = 0; i < blocks.length; i++) {
		const block = blocks[i]!;
		const highlighted = await codeToHtml(block.code, { lang: block.lang, theme: 'vitesse-dark' });
		html = html.replace(`<p>@@CODE${i}@@</p>`, highlighted).replace(`@@CODE${i}@@`, highlighted);
	}

	return html;
}

/** Extrai os h2/h2 de um HTML já renderizado para montar o sumário da página. */
export interface TocItem {
	id: string;
	text: string;
	depth: 2 | 3;
}

export function extractToc(html: string): TocItem[] {
	const items: TocItem[] = [];
	const re = /<h([23]) id="([^"]+)">([\s\S]*?)<\/h\1>/g;
	let m: RegExpExecArray | null;
	while ((m = re.exec(html)) !== null) {
		// remove a âncora "#" e as tags antes de montar o texto do item
		const text = m[3]!
			.replace(/<a class="anchor"[\s\S]*?<\/a>/g, '')
			.replace(/<[^>]+>/g, '')
			.trim();
		items.push({ depth: Number(m[1]) as 2 | 3, id: m[2]!, text });
	}
	return items;
}

export function docBySlug(slug: string): DocMeta | undefined {
	return DOCS.find((d) => d.slug === slug);
}

export function neighbors(slug: string): { prev?: DocMeta; next?: DocMeta } {
	const i = DOCS.findIndex((d) => d.slug === slug);
	return { prev: i > 0 ? DOCS[i - 1] : undefined, next: i >= 0 && i < DOCS.length - 1 ? DOCS[i + 1] : undefined };
}

/* ——— busca ——— */

export interface SearchDoc extends DocMeta {
	/** Seção agrupada (para mostrar no resultado). */
	group: string;
}

export const SEARCH_INDEX: SearchDoc[] = DOCS.map((d) => ({ ...d, group: d.section }));

/** Busca case-insensitive por título, resumo ou seção. Retorna no máximo `limit` itens. */
export function searchDocs(query: string, limit = 8): SearchDoc[] {
	const q = query.trim().toLowerCase();
	if (q === '') return [];
	const scored = SEARCH_INDEX.map((doc) => {
		const title = doc.title.toLowerCase();
		const summary = doc.summary.toLowerCase();
		let score = 0;
		if (title.startsWith(q)) score = 100 - title.indexOf(q);
		else if (title.includes(q)) score = 60;
		else if (summary.includes(q)) score = 30;
		else if (doc.group.toLowerCase().includes(q)) score = 10;
		return { doc, score };
	})
		.filter((r) => r.score > 0)
		.sort((a, b) => b.score - a.score);
	return scored.slice(0, limit).map((r) => r.doc);
}

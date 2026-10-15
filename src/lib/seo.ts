import { SITE, OG_IMAGE } from './site.ts';

/** URL absoluta a partir de um caminho ("/docs/logs" → "https://…/docs/logs"). */
export function absoluteUrl(path = '/'): string {
	const base = SITE.url.replace(/\/+$/, '');
	if (path === '' || path === '/') return `${base}/`;
	return `${base}/${path.replace(/^\/+/, '')}`;
}

/** Serializa para JSON-LD escapando `<` e evita quebrar a tag <script>. */
export function jsonLd(value: unknown): string {
	return JSON.stringify(value).replace(/</g, '\\u003c');
}

/** Concatena títulos sem repetir o nome do site. */
export function pageTitle(title?: string): string {
	if (!title) return `${SITE.name} · ${SITE.tagline}`;
	return `${title} · ${SITE.name}`;
}

/* ——— dados estruturados ——— */

/** `WebSite` + `SoftwareSourceCode` — da home. */
export function websiteGraph(path = '/'): string {
	const url = absoluteUrl(path);
	return jsonLd({
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'WebSite',
				'@id': `${url}#website`,
				url,
				name: SITE.name,
				description: SITE.description,
				inLanguage: SITE.locale,
				primaryImageOfPage: {
					'@type': 'ImageObject',
					url: absoluteUrl(OG_IMAGE.path),
					width: OG_IMAGE.width,
					height: OG_IMAGE.height
				},
				publisher: { '@id': `${url}#org` }
			},
			{
				'@type': 'SoftwareSourceCode',
				'@id': `${url}#software`,
				name: SITE.name,
				alternateName: 'lifeline.js',
				description: SITE.description,
				programmingLanguage: 'TypeScript',
				runtimePlatform: 'Node.js',
				codeRepository: SITE.github,
				codeSampleType: 'example',
				license: 'https://opensource.org/licenses/MIT',
				version: SITE.version,
				keywords: SITE.keywords.join(', '),
				inLanguage: SITE.locale,
				offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
				publisher: { '@id': `${url}#org` }
			},
			{
				'@type': 'Organization',
				'@id': `${url}#org`,
				name: SITE.author,
				url: SITE.github,
				sameAs: [SITE.github, SITE.npm]
			}
		]
	});
}

/** `TechArticle` + breadcrumb — das páginas de documentação. */
export function docGraph(meta: { slug: string; title: string; section: string; summary: string }): string {
	const url = absoluteUrl(`docs/${meta.slug}`);
	const root = absoluteUrl('/');
	return jsonLd({
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'TechArticle',
				'@id': `${url}#article`,
				headline: meta.title,
				description: meta.summary,
				abstract: meta.summary,
				url,
				mainEntityOfPage: { '@type': 'WebPage', '@id': url },
				inLanguage: SITE.locale,
				keywords: [meta.section, SITE.name, 'lifeline.js', ...SITE.keywords].join(', '),
				image: {
					'@type': 'ImageObject',
					url: absoluteUrl(OG_IMAGE.path),
					width: OG_IMAGE.width,
					height: OG_IMAGE.height
				},
				author: { '@type': 'Organization', name: SITE.author, url: SITE.github },
				publisher: { '@id': `${root}#org` },
				isPartOf: { '@id': `${root}#website` }
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${url}#breadcrumb`,
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: root },
					{ '@type': 'ListItem', position: 2, name: 'Docs', item: absoluteUrl('docs/introducao') },
					{ '@type': 'ListItem', position: 3, name: meta.title, item: url }
				]
			}
		]
	});
}

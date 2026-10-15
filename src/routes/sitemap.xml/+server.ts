import type { RequestHandler } from './$types.js';
import { DOCS } from '#lib/docs.ts';
import { absoluteUrl } from '#lib/seo.ts';

export const prerender = true;

const routes = ['/', ...DOCS.map((d) => `/docs/${d.slug}`)];

export const GET: RequestHandler = () => {
	const urls = routes
		.map(
			(route) =>
				`  <url>\n    <loc>${absoluteUrl(route)}</loc>\n    <priority>${route === '/' ? '1.0' : '0.8'}</priority>\n  </url>`
		)
		.join('\n');

	const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

	return new Response(body, {
		headers: { 'Content-Type': 'application/xml; charset=utf-8' }
	});
};

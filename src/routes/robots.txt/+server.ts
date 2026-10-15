import type { RequestHandler } from './$types.js';
import { absoluteUrl } from '#lib/seo.ts';

export const prerender = true;

export const GET: RequestHandler = () => {
	const body = `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('sitemap.xml')}\n`;

	return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

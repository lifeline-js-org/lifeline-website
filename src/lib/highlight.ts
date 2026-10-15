import { codeToHtml } from 'shiki';
import type { CodeSample } from './code.ts';

const THEME = 'vitesse-dark';

/** Destaca um bloco de código com shiki e devolve HTML seguro para {@html}. */
export async function highlight(sample: CodeSample): Promise<string> {
	return codeToHtml(sample.code, { lang: sample.lang, theme: THEME });
}

export interface RenderedCode {
	html: string;
}

export async function highlightAll(samples: Record<string, CodeSample>): Promise<Record<string, RenderedCode>> {
	const entries = await Promise.all(
		Object.entries(samples).map(async ([key, sample]) => [key, { html: await highlight(sample) }] as const)
	);
	return Object.fromEntries(entries);
}

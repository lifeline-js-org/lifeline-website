import {
	quickstartJs,
	quickstartTs,
	manualCode,
	withLifelineJs,
	withLifelineTs,
	examples,
	errorContractJs,
	errorContractTs,
	testSuiteJs,
	testSuiteTs,
	type CodeSample
} from '#lib/code.ts';
import { highlight } from '#lib/highlight.ts';

const render = (sample: CodeSample) => highlight(sample);

export async function load() {
	const [quickJs, quickTs, manual, lifelineJs, lifelineTs, errJs, errTs, testJs, testTs] = await Promise.all([
		render(quickstartJs),
		render(quickstartTs),
		render({ lang: 'js', code: manualCode }),
		render(withLifelineJs),
		render(withLifelineTs),
		render(errorContractJs),
		render(errorContractTs),
		render(testSuiteJs),
		render(testSuiteTs)
	]);

	const renderedExamples = await Promise.all(
		examples.map(async (ex) => [ex.slug, { js: { html: await render(ex.js) }, ts: { html: await render(ex.ts) } }] as const)
	);

	return {
		quickstart: { js: { html: quickJs }, ts: { html: quickTs } },
		compare: { manual: { html: manual }, js: { html: lifelineJs }, ts: { html: lifelineTs } },
		errors: { js: { html: errJs }, ts: { html: errTs } },
		tests: { js: { html: testJs }, ts: { html: testTs } },
		examples: Object.fromEntries(renderedExamples)
	};
}

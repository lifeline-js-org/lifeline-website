<script lang="ts">
	import Header from '#lib/components/Header.svelte';
	import Hero from '#lib/components/Hero.svelte';
	import Features from '#lib/components/Features.svelte';
	import Pulse from '#lib/components/Pulse.svelte';
	import Simulator from '#lib/components/Simulator.svelte';
	import Compare from '#lib/components/Compare.svelte';
	import Examples from '#lib/components/Examples.svelte';
	import Api from '#lib/components/Api.svelte';
	import Errors from '#lib/components/Errors.svelte';
	import Tests from '#lib/components/Tests.svelte';
	import DocsCta from '#lib/components/DocsCta.svelte';
	import Footer from '#lib/components/Footer.svelte';
	import Seo from '#lib/components/Seo.svelte';
	import { websiteGraph } from '#lib/seo.ts';

	let { data } = $props();
</script>

<Seo path="/" jsonLd={websiteGraph('/')} />

<Header />
<main id="conteudo">
	<Hero js={data.quickstart.js} ts={data.quickstart.ts} />
	<Features />
	<Pulse />
	<Simulator />
	<Compare manual={data.compare.manual} js={data.compare.js} ts={data.compare.ts} />
	<Examples rendered={data.examples} />
	<Api />
	<Errors js={data.errors.js} ts={data.errors.ts} />
	<Tests js={data.tests.js} ts={data.tests.ts} />
	<DocsCta />
</main>
<Footer />

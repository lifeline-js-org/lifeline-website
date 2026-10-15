<script lang="ts">
	import { SITE, OG_IMAGE } from '#lib/site.ts';
	import { absoluteUrl, pageTitle } from '#lib/seo.ts';

	let {
		title,
		description = SITE.description,
		path = '/',
		type = 'website',
		image = OG_IMAGE.path,
		imageAlt = OG_IMAGE.alt,
		jsonLd
	}: {
		/** Título da página, sem o sufixo — o componente acrescenta "· LifeLine.js". */
		title?: string;
		description?: string;
		/** Caminho da rota, usado em canonical e og:url. */
		path?: string;
		type?: 'website' | 'article';
		image?: string;
		imageAlt?: string;
		/** JSON-LD já serializado (use jsonLd()/websiteGraph()/docGraph()). */
		jsonLd?: string;
	} = $props();

	const full = $derived(pageTitle(title));
	const url = $derived(absoluteUrl(path));
	const absImage = $derived(image.startsWith('http') ? image : absoluteUrl(image));
</script>

<svelte:head>
	<title>{full}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={url} />
	<meta name="robots" content="index, follow, max-image-preview:large" />
	<meta name="author" content={SITE.author} />
	<meta name="color-scheme" content="dark" />
	<meta name="theme-color" content="#000000" />
	{#if SITE.keywords.length}
		<meta name="keywords" content={SITE.keywords.join(', ')} />
	{/if}

	<!-- Open Graph -->
	<meta property="og:type" content={type} />
	<meta property="og:site_name" content={SITE.name} />
	<meta property="og:locale" content={SITE.locale} />
	<meta property="og:title" content={full} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={url} />
	<meta property="og:image" content={absImage} />
	<meta property="og:image:secure_url" content={absImage} />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:width" content={String(OG_IMAGE.width)} />
	<meta property="og:image:height" content={String(OG_IMAGE.height)} />
	<meta property="og:image:alt" content={imageAlt} />
	{#if type === 'article'}
		<meta property="article:section" content="Documentação" />
		<meta property="article:author" content={SITE.github} />
	{/if}

	<!-- Twitter / X -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={full} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={absImage} />
	<meta name="twitter:image:alt" content={imageAlt} />

	{#if jsonLd}
		{@html `<script type="application/ld+json">${jsonLd}</script>`}
	{/if}
</svelte:head>

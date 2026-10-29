<script lang="ts">
	import './layout.css';
	import '../app.css';
	import { resolve } from '$app/paths';
	import favicon from '$lib/assets/favicon.ico';
	import { page } from '$app/stores';

	import CommandPalette from '$lib/components/CommandPalette.svelte';
	import { cn } from '$lib/utils';
	import { ditherWave } from '$lib/palette';

	import Dither from '$lib/components/dither/Dither.svelte';

	let { children, data } = $props();

	let isLoaded = $state(false);
	let scrollY = $state(0);
	let headerEl = $state<HTMLElement | undefined>();
	let contentEl = $state<HTMLElement | undefined>();
	let clipInset = $state(0);

	function handleLoad() {
		isLoaded = true;
	}

	// The header stays transparent so the single page canvas shows through it.
	// Content under the bar is clipped instead of covered by a second WebGL scene.
	// Negative side insets keep the hanging table of contents, which sits outside
	// the column, inside the clip region.
	function measureClip() {
		if (!headerEl || !contentEl) {
			clipInset = 0;
			return;
		}
		const inset = headerEl.getBoundingClientRect().bottom - contentEl.getBoundingClientRect().top;
		const next = Math.max(0, Math.round(inset));
		if (next !== clipInset) clipInset = next;
	}

	$effect(() => {
		const header = headerEl;
		if (!header) return;
		const observer = new ResizeObserver(() => measureClip());
		observer.observe(header);
		return () => observer.disconnect();
	});

	$effect(() => {
		void scrollY;
		void $page.url.pathname;
		measureClip();
	});

	let showBackground = $derived($page.url.pathname === '/');

	$effect(() => {
		if (!showBackground) {
			isLoaded = true;
		}
	});
	const commitSha = __APP_COMMIT_SHA__;
	const commitBranch = __APP_COMMIT_BRANCH__;
	const commitLabel = commitSha ? `${commitBranch}@${commitSha.slice(0, 7)}` : '';
	const commitHref = commitSha ? `https://github.com/rycerzes/website/commit/${commitSha}` : '';

	let indexable = $derived($page.status === 200);
</script>

<svelte:head>
	<title>{data.seo.title}</title>
	<meta name="description" content={data.seo.description} />
	<meta name="robots" content={indexable ? 'index, follow' : 'noindex'} />
	{#if indexable}
		<link rel="canonical" href={data.seo.canonical} />
	{/if}
	<meta property="og:site_name" content="swappy" />
	<meta property="og:type" content={data.seo.type} />
	<meta property="og:title" content={data.seo.title} />
	<meta property="og:description" content={data.seo.description} />
	<meta property="og:url" content={data.seo.canonical} />
	<meta property="og:image" content={data.seo.image} />
	<meta property="og:image:alt" content={data.seo.imageAlt} />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={data.seo.title} />
	<meta name="twitter:description" content={data.seo.description} />
	<meta name="twitter:image" content={data.seo.image} />
	<meta name="twitter:image:alt" content={data.seo.imageAlt} />
	{@html `<script type="application/ld+json">${data.seo.jsonLd}</script>`}
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;0,700;0,800;1,300;1,400;1,500;1,700;1,800&display=swap"
		rel="stylesheet"
	/>
	<link
		href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<svelte:window bind:scrollY />

<!-- Global Background Effects -->
{#if showBackground}
	<div
		class="fixed top-0 left-1/2 -z-20 -translate-x-1/2 transition-opacity duration-500"
		style="width: 100vw; height: 100vh; background-color: var(--color-uv-black);"
	>
		<Dither
			waveColor={ditherWave}
			disableAnimation={false}
			enableMouseInteraction={false}
			mouseRadius={0}
			colorNum={6.2}
			waveAmplitude={0.07}
			waveFrequency={10}
			waveSpeed={0.01}
			onLoad={handleLoad}
		/>
	</div>
	<div
		class="dither-overlay fixed top-0 left-1/2 -translate-x-1/2 transition-opacity duration-500"
		style="width: 100vw; height: 100vh;"
	></div>
{/if}

<div
	class="relative z-10 mx-auto flex min-h-screen w-full max-w-2xl flex-col px-6 transition-opacity duration-1000"
>
	<header
		bind:this={headerEl}
		class={cn(
			'sticky top-0 z-50 -mx-6 mb-8 flex items-center bg-transparent px-6 pt-6 pb-2 opacity-0 transition-all duration-300',
			scrollY > 20 && 'py-4',
			isLoaded && 'animate-enter'
		)}
	>
		<nav
			class="no-scrollbar relative z-10 flex w-full items-center justify-end gap-5 overflow-x-auto text-xs"
		>
			<a
				class="border-b border-transparent pb-1 tracking-wide text-uv-text-dim transition-colors hover:border-uv-highlight/50 hover:text-uv-text-main"
				href={resolve('/')}>Home</a
			>
			<a
				class="border-b border-transparent pb-1 tracking-wide text-uv-text-dim transition-colors hover:border-uv-highlight/50 hover:text-uv-text-main"
				href={resolve('/blog')}>Blog</a
			>
			<a
				class="border-b border-transparent pb-1 tracking-wide text-uv-text-dim transition-colors hover:border-uv-highlight/50 hover:text-uv-text-main"
				href="https://github.com/rycerzes/resume/blob/main/resume.pdf"
				target="_blank">Resume</a
			>
			<a
				class="border-b border-transparent pb-1 tracking-wide text-uv-text-dim transition-colors hover:border-uv-highlight/50 hover:text-uv-text-main"
				href={resolve('/about')}>About</a
			>
			<a
				class="border-b border-transparent pb-1 tracking-wide text-uv-text-dim transition-colors hover:border-uv-highlight/50 hover:text-uv-text-main"
				href={resolve('/ai')}>AI</a
			>
		</nav>
	</header>

	<div
		bind:this={contentEl}
		class="flex flex-1 flex-col"
		style:clip-path={clipInset > 0 ? `inset(${clipInset}px -50vw 0 -50vw)` : undefined}
	>
		{#key $page.url.pathname}
			<main
				class={cn('flex flex-1 flex-col gap-16 opacity-0', isLoaded && 'animate-enter delay-100')}
			>
				{@render children()}
			</main>
		{/key}

		<footer
			class={cn(
				'mt-12 grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-2 border-t border-uv-mute py-10 text-[11px] tracking-wide text-uv-text-dim opacity-0',
				isLoaded && 'animate-enter delay-200'
			)}
			id="contact"
		>
			<div>© {new Date().getFullYear()} rycerzes</div>
			<div class="flex items-center justify-end gap-4">
				<a class="transition-colors hover:text-uv-highlight" href="https://x.com/swaapppyyy"
					>x/twtr</a
				>
				<a class="transition-colors hover:text-uv-highlight" href="https://github.com/rycerzes"
					>github</a
				>
				<a class="transition-colors hover:text-uv-highlight" href="mailto:swapnil@rycerz.es"
					>email</a
				>
			</div>
			<div>swappy</div>
			{#if commitLabel}
				<a
					class="justify-self-end text-right transition-colors hover:text-uv-highlight"
					href={commitHref}
					target="_blank"
					rel="external noopener noreferrer">{commitLabel}</a
				>
			{/if}
		</footer>
	</div>

	<CommandPalette />
</div>

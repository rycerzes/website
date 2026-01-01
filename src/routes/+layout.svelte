<script lang="ts">
	import './layout.css';
	import '../app.css';
	import favicon from '$lib/assets/favicon.ico';
	import { page } from '$app/stores';

	import ThemeToggle from '$lib/ThemeToggle.svelte';
	import CommandPalette from '$lib/components/CommandPalette.svelte';
	import { cn } from '$lib/utils';

	import Dither from '$lib/components/dither/Dither.svelte';

	let { children } = $props();

	let isLoaded = $state(false);
	let scrollY = $state(0);

	function handleLoad() {
		isLoaded = true;
	}

	let showBackground = $derived($page.url.pathname === '/');

	$effect(() => {
		if (!showBackground) {
			isLoaded = true;
		}
	});
</script>

<svelte:head>
	<title>swappy</title>
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
			waveColor={[0.28, 0.2, 0.55]}
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
	class="relative z-10 mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 transition-opacity duration-1000 md:px-12"
>
	<!-- 
		Lorem ipsum dolor sit amet.
	-->

	<!-- Header from design -->
	<header
		class={cn(
			'sticky top-0 z-50 -mx-6 mb-4 flex flex-col justify-end px-6 pt-4 pb-2 opacity-0 transition-all duration-300 md:-mx-12 md:flex-row md:items-center md:px-12 md:pt-6',
			scrollY > 20 ? 'py-4 md:py-4' : 'bg-transparent',
			isLoaded && 'animate-enter'
		)}
	>
		{#if scrollY > 20}
			<div class="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-b-xl">
				<div
					style="position: absolute; width: 100vw; height: 100vh; left: 50%; transform: translateX(-50%); top: 0; background-color: var(--color-uv-black);"
				>
					<Dither
						waveColor={[0.28, 0.2, 0.55]}
						disableAnimation={false}
						enableMouseInteraction={false}
						mouseRadius={0}
						colorNum={6.2}
						waveAmplitude={0.07}
						waveFrequency={10}
						waveSpeed={0.01}
					/>
				</div>
				<div
					class="dither-overlay"
					style="position: absolute; width: 100vw; height: 100vh; left: 50%; transform: translateX(-50%); top: 0;"
				></div>
			</div>
		{/if}
		<nav
			class="no-scrollbar relative z-10 flex w-full items-center justify-center gap-6 overflow-x-auto text-sm md:w-auto md:justify-end md:gap-10"
		>
			<a
				class="border-b border-transparent pb-1 text-xs tracking-widest text-uv-text-dim transition-colors hover:border-violet-500/50 hover:text-white"
				href="/">Home</a
			>
			<a
				class="border-b border-transparent pb-1 text-xs tracking-widest text-uv-text-dim transition-colors hover:border-violet-500/50 hover:text-white"
				href="/about">About</a
			>
			<a
				class="border-b border-transparent pb-1 text-xs tracking-widest text-uv-text-dim transition-colors hover:border-violet-500/50 hover:text-white"
				href="https://github.com/rycerzes/resume/blob/main/resume.pdf"
				target="_blank">Resume</a
			>
			<a
				class="border-b border-transparent pb-1 text-xs tracking-widest text-uv-text-dim transition-colors hover:border-violet-500/50 hover:text-white"
				href="/blog">Blog</a
			>
		</nav>
	</header>

	{#key $page.url.pathname}
		<main
			class={cn('flex flex-1 flex-col gap-16 opacity-0', isLoaded && 'animate-enter delay-100')}
		>
			{@render children()}
		</main>
	{/key}

	<footer
		class={cn(
			'mt-12 flex flex-col items-start justify-between gap-8 border-t border-theme py-10 opacity-0 md:flex-row md:items-center',
			isLoaded && 'animate-enter delay-200'
		)}
		id="contact"
	>
		<div class="flex flex-col gap-2">
			<div class="text-[10px] tracking-widest text-uv-text-dim">
				© {new Date().getFullYear()} Lorem
			</div>
			<div class="text-[10px] tracking-widest text-violet-500/60">Lorem Ipsum</div>
		</div>
		<div class="flex items-center gap-8">
			<a
				class="text-xs font-medium tracking-wider text-uv-text-dim transition-colors hover:text-white hover:shadow-[0_0_15px_rgba(167,139,250,0.5)]"
				href="/">Twitter</a
			>
			<a
				class="text-xs font-medium tracking-wider text-uv-text-dim transition-colors hover:text-white hover:shadow-[0_0_15px_rgba(167,139,250,0.5)]"
				href="/">GitHub</a
			>
		</div>
	</footer>

	<CommandPalette />
</div>

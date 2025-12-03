<script lang="ts">
	import './layout.css';
	import '../app.css';
	import favicon from '$lib/assets/favicon.ico';

	import ThemeToggle from '$lib/ThemeToggle.svelte';
	import CommandPalette from '$lib/components/CommandPalette.svelte';
	import { cn } from '$lib/utils';

	let { children } = $props();

	let scrollY = $state(0);
</script>

<svelte:head>
	<title>swappy</title>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700;800&display=swap" rel="stylesheet">
	<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">
</svelte:head>

<svelte:window bind:scrollY />

<!-- Global Background Effects -->
<div class="dither-bg"></div>
<div class="dither-overlay"></div>

<div class="relative flex flex-col w-full max-w-4xl mx-auto min-h-screen px-6 md:px-12 z-10">
	<!-- 
		Lorem ipsum dolor sit amet.
	-->
	
	<!-- Header from design -->
	<header class={cn(
		"sticky top-0 z-50 -mx-6 md:-mx-12 px-6 md:px-12 flex flex-col md:flex-row md:items-center justify-end pt-4 pb-2 md:pt-6 mb-4 transition-all duration-300",
		scrollY > 20 ? "py-4 md:py-4" : "bg-transparent"
	)}>
		{#if scrollY > 20}
			<div class="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
				<div class="dither-bg" style="position: absolute; width: 100vw; height: 100vh; left: 50%; transform: translateX(-50%); top: 0;"></div>
				<div class="dither-overlay" style="position: absolute; width: 100vw; height: 100vh; left: 50%; transform: translateX(-50%); top: 0;"></div>
			</div>
		{/if}
		<nav class="relative z-10 flex items-center gap-6 md:gap-10 text-sm overflow-x-auto no-scrollbar w-full md:w-auto justify-center md:justify-end">

			<a class="text-uv-text-dim hover:text-white transition-colors uppercase tracking-widest text-xs border-b border-transparent hover:border-violet-500/50 pb-1" href="#about">Lorem</a>
			<a class="text-uv-text-dim hover:text-white transition-colors uppercase tracking-widest text-xs border-b border-transparent hover:border-violet-500/50 pb-1" href="#projects">Ipsum</a>
			<a class="text-uv-text-dim hover:text-white transition-colors uppercase tracking-widest text-xs border-b border-transparent hover:border-violet-500/50 pb-1" href="#writing">Dolor</a>
			<a class="text-uv-text-dim hover:text-white transition-colors uppercase tracking-widest text-xs border-b border-transparent hover:border-violet-500/50 pb-1" href="#resources">Sit</a>
		</nav>
	</header>

	<main class="flex-1 flex flex-col gap-16">
		{@render children()}
	</main>

	<footer class="py-10 mt-12 border-t border-theme flex flex-col md:flex-row justify-between items-start md:items-center gap-8" id="contact">
		<div class="flex flex-col gap-2">
			<div class="text-[10px] text-uv-text-dim uppercase tracking-widest">
				© {new Date().getFullYear()} Lorem
			</div>
			<div class="text-[10px] text-violet-800/40 uppercase tracking-widest">
				Lorem Ipsum
			</div>
		</div>
		<div class="flex items-center gap-8">
			<a class="text-xs font-medium text-uv-text-dim hover:text-white uppercase tracking-wider transition-colors hover:shadow-[0_0_10px_rgba(139,92,246,0.3)]" href="/">Twitter</a>
			<a class="text-xs font-medium text-uv-text-dim hover:text-white uppercase tracking-wider transition-colors hover:shadow-[0_0_10px_rgba(139,92,246,0.3)]" href="/">GitHub</a>
		</div>
	</footer>


	<CommandPalette />
</div>

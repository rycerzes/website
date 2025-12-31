<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	let imageUrl = $state('');
	let loading = $state(true);

	onMount(() => {
		// Add timestamp to prevent caching
		imageUrl = `https://cataas.com/cat?t=${Date.now()}`;
	});

	function handleLoad() {
		loading = false;
	}
</script>

<div class="flex min-h-[70vh] flex-col items-center justify-center gap-8" in:fade>
	<!-- Image Container with CRT Effect -->
	<div
		class="bg-uv-surface border-theme/50 crt-effect relative flex aspect-[4/3] w-full max-w-lg items-center justify-center overflow-hidden rounded-none border"
	>
		{#if imageUrl}
			<img
				src={imageUrl}
				alt="Random Cat"
				class="h-full w-full object-cover transition-transform duration-500 hover:scale-105 {loading
					? 'opacity-0'
					: 'opacity-100'}"
				onload={handleLoad}
			/>
		{/if}

		{#if loading}
			<div class="absolute inset-0 flex items-center justify-center">
				<span class="animate-pulse text-sm tracking-widest text-uv-text-dim">SUMMONING CAT...</span>
			</div>
		{/if}
		<!-- Overlay for un-loaded state or extra vibe if needed -->
		<div class="pointer-events-none absolute inset-0 bg-violet-900/10 mix-blend-overlay"></div>
	</div>

	<div class="flex flex-col items-center gap-4 text-center">
		<h1 class="text-2xl font-bold tracking-tight text-white">
			<span class="text-violet-400">404</span> Not Found
		</h1>
		<p class="max-w-md text-sm text-uv-text-dim">
			the page you seek is elsewhere. the cat is here.
		</p>

		<a
			href="/"
			class="text-uv-text mt-6 border border-violet-500/30 px-8 py-3 text-xs tracking-widest uppercase transition-all hover:border-violet-500 hover:bg-uv-mute/40 hover:text-white"
		>
			Return Home
		</a>
	</div>
</div>

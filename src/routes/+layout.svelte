<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import ThemeToggle from '$lib/ThemeToggle.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Inconsolata:wght@200..900&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
</svelte:head>

<div class="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
	<header class="fixed right-4 top-4 z-50">
		<ThemeToggle />
	</header>

	{@render children()}
</div>

<script lang="ts">
	import './layout.css';
	import '../app.css';
	import favicon from '$lib/assets/favicon.ico';
	import ThemeToggle from '$lib/ThemeToggle.svelte';
	import CommandPalette from '$lib/components/CommandPalette.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>swappy</title>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inconsolata:wght@200..900&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div
	class="flex min-h-screen flex-col"
	style="background: var(--background); color: var(--foreground);"
>
	<header class="fixed top-4 right-4 z-50">
		<ThemeToggle />
	</header>

	<CommandPalette />

	<main class="container flex-1 px-4 pt-24">
		{@render children()}
	</main>
</div>

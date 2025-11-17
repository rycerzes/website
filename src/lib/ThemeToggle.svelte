<script lang="ts">
	type Theme = 'light' | 'dark';

	let theme = $state<Theme>('light');
	let initialized = $state(false);

	// Update DOM whenever theme changes
	$effect(() => {
		if (typeof document !== 'undefined') {
			document.documentElement.classList.remove('light', 'dark');
			document.documentElement.classList.add(theme);
			if (initialized) {
				localStorage.setItem('theme', theme);
			}
		}
	});

	// Initialize theme on mount
	$effect(() => {
		if (!initialized && typeof window !== 'undefined') {
			const savedTheme = localStorage.getItem('theme') as Theme | null;
			if (savedTheme) {
				theme = savedTheme;
			} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
				theme = 'dark';
			}
			initialized = true;
		}
	});

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
	}
</script>

<button
	onclick={toggleTheme}
	class="rounded-lg p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
	aria-label="Toggle theme"
>
	{#if theme === 'light'}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<circle cx="12" cy="12" r="4"></circle>
			<path d="M12 2v2"></path>
			<path d="M12 20v2"></path>
			<path d="m4.93 4.93 1.41 1.41"></path>
			<path d="m17.66 17.66 1.41 1.41"></path>
			<path d="M2 12h2"></path>
			<path d="M20 12h2"></path>
			<path d="m6.34 17.66-1.41 1.41"></path>
			<path d="m19.07 4.93-1.41 1.41"></path>
		</svg>
	{:else}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
		</svg>
	{/if}
</button>

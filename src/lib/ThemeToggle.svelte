<script lang="ts">
	type Theme = 'light' | 'dark' | 'system';

	let theme = $state<Theme>('system');
	let initialized = $state(false);

	// Get the actual theme to apply based on system preference
	function getResolvedTheme(currentTheme: Theme): 'light' | 'dark' {
		if (currentTheme === 'system') {
			return typeof window !== 'undefined' &&
				window.matchMedia('(prefers-color-scheme: dark)').matches
				? 'dark'
				: 'light';
		}
		return currentTheme;
	}

	// Update DOM whenever theme changes
	$effect(() => {
		if (typeof document !== 'undefined') {
			const resolvedTheme = getResolvedTheme(theme);
			document.documentElement.classList.remove('light', 'dark');
			document.documentElement.classList.add(resolvedTheme);
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
			}
			initialized = true;
		}
	});

	// Listen for system theme changes when in system mode
	$effect(() => {
		if (typeof window !== 'undefined' && theme === 'system') {
			const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
			const handleChange = () => {
				const resolvedTheme = getResolvedTheme('system');
				document.documentElement.classList.remove('light', 'dark');
				document.documentElement.classList.add(resolvedTheme);
			};
			mediaQuery.addEventListener('change', handleChange);
			return () => mediaQuery.removeEventListener('change', handleChange);
		}
	});
</script>

<script lang="ts">
	import { themeStore, type Theme } from './theme.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';
	import Laptop from '@lucide/svelte/icons/laptop';

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
			const resolvedTheme = getResolvedTheme(themeStore.value);
			document.documentElement.classList.remove('light', 'dark');
			document.documentElement.classList.add(resolvedTheme);
			if (initialized) {
				localStorage.setItem('theme', themeStore.value);
			}
		}
	});

	// Initialize theme on mount
	$effect(() => {
		if (!initialized && typeof window !== 'undefined') {
			const savedTheme = localStorage.getItem('theme') as Theme | null;
			if (savedTheme) {
				themeStore.value = savedTheme;
			}
			initialized = true;
		}
	});

	// Listen for system theme changes when in system mode
	$effect(() => {
		if (typeof window !== 'undefined' && themeStore.value === 'system') {
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

	function toggleTheme() {
		if (themeStore.value === 'light') themeStore.value = 'dark';
		else if (themeStore.value === 'dark') themeStore.value = 'system';
		else themeStore.value = 'light';
	}
</script>

<Button variant="ghost" size="icon" onclick={toggleTheme}>
	{#if themeStore.value === 'light'}
		<Sun class="h-[1.2rem] w-[1.2rem]" />
	{:else if themeStore.value === 'dark'}
		<Moon class="h-[1.2rem] w-[1.2rem]" />
	{:else}
		<Laptop class="h-[1.2rem] w-[1.2rem]" />
	{/if}
	<span class="sr-only">Toggle theme</span>
</Button>

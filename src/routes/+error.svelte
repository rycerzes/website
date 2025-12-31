<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	onMount(() => {
		if ($page.status === 404) {
			goto('/404', { replaceState: true });
		}
	});
</script>

{#if $page.status !== 404}
	<div class="flex flex-col items-center justify-center min-h-[70vh] gap-4 text-center">
		<h1 class="text-4xl font-light text-white">Error {$page.status}</h1>
		<p class="text-uv-text-dim">{$page.error?.message}</p>
		<a
			href="/"
			class="mt-4 px-6 py-2 border border-violet-500/30 hover:border-violet-500 text-sm tracking-widest text-uv-text hover:text-white transition-all rounded-full uppercase"
		>
			Return Home
		</a>
	</div>
{/if}

<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	onMount(() => {
		if ($page.status === 404) {
			goto(resolve('/404'), { replaceState: true });
		}
	});
</script>

{#if $page.status !== 404}
	<div class="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
		<h1 class="text-4xl font-light text-white">Error {$page.status}</h1>
		<p class="text-uv-text-dim">{$page.error?.message}</p>
		<a
			href={resolve('/')}
			class="text-uv-text mt-4 rounded-full border border-violet-500/30 px-6 py-2 text-sm tracking-widest uppercase transition-all hover:border-violet-500 hover:text-white"
		>
			Return Home
		</a>
	</div>
{/if}

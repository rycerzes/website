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
		<h1 class="text-4xl font-light text-uv-text-main">Error {$page.status}</h1>
		<p class="text-uv-text-dim">{$page.error?.message}</p>
		<a
			href={resolve('/')}
			class="mt-4 rounded-full border border-uv-highlight/30 px-6 py-2 text-sm tracking-widest text-uv-text-dim uppercase transition-all hover:border-uv-highlight hover:text-uv-text-main"
		>
			Return Home
		</a>
	</div>
{/if}

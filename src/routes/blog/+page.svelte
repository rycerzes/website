<script lang="ts">
	import { resolve } from '$app/paths';

	let { data } = $props();

	function shortenDescription(excerpt: string): string {
		const text = excerpt.trim();
		const clause = text.split(/\s+—\s+|,\s+and\s+/)[0];
		return (clause ?? text).trim();
	}
</script>

<div class="w-full py-8">
	<header class="mb-8">
		<h1 class="text-xs tracking-widest text-uv-text-dim">blog</h1>
		<p class="mt-3 text-sm leading-6 text-uv-text-body">all opinions are my own</p>
	</header>

	<div class="flex flex-col divide-y divide-uv-mute/40">
		{#each data.posts as post (post.slug)}
			<a
				href={resolve('/blog/[slug]', { slug: post.slug })}
				class="group grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-6 gap-y-1 py-4"
			>
				<h2
					class="min-w-0 text-sm leading-5 font-medium text-uv-text-main transition-colors group-hover:text-uv-highlight"
				>
					{post.title}
				</h2>
				<span class="pt-0.5 text-xs text-uv-text-dim">{post.date}</span>
				<p
					class="min-w-0 text-xs leading-4 text-uv-text-dim transition-colors group-hover:text-uv-text-main/80"
				>
					{shortenDescription(post.excerpt)}
				</p>
			</a>
		{/each}
	</div>

	<div class="mt-10">
		<a
			href={resolve('/')}
			class="text-xs text-uv-text-dim transition-colors hover:text-uv-highlight"
		>
			← back to home
		</a>
	</div>
</div>

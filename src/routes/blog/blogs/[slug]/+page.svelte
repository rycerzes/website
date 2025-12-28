<script lang="ts">
	let { data } = $props();
</script>

<article class="container mx-auto px-4 py-12 max-w-3xl prose prose-invert prose-violet">
	<header class="mb-8 border-b border-theme/30 pb-8">
		<div class="flex flex-col gap-4">
			<div class="flex items-center gap-4 text-xs font-mono text-violet-400">
				<span>{data.post.date}</span>
				<span>•</span>
				<div class="flex gap-2">
					{#each data.post.tags as tag}
						<span class="uppercase tracking-wide">#{tag}</span>
					{/each}
				</div>
			</div>

			<h1 class="text-4xl font-bold text-violet-100 tracking-tight !mb-0">{data.post.title}</h1>
			<p class="text-xl text-uv-text-dim !mt-2">{data.post.excerpt}</p>
		</div>
	</header>

	<div class="mdx-content">
		<svelte:component this={data.post.component} />
	</div>
</article>

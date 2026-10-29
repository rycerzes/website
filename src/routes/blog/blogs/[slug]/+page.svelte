<script lang="ts">
	let { data } = $props();
	import MdxContent from '$lib/components/MdxContent.svelte';
</script>

<article class="prose w-full max-w-none py-12 prose-invert prose-a:text-uv-link">
	<header class="mb-8 border-b border-uv-mute/30 pb-8">
		<div class="flex flex-col gap-4">
			<div class="flex items-center gap-4 font-mono text-xs text-uv-highlight">
				<span>{data.post.date}</span>
				<span>•</span>
				<span>{data.post.readingTime}</span>
				<span>•</span>
				<div class="flex gap-2">
					{#each data.post.tags as tag (tag)}
						<span class="tracking-wide uppercase">#{tag}</span>
					{/each}
				</div>
			</div>

			<h1 class="mb-0! text-4xl font-bold tracking-tight text-uv-text-main">{data.post.title}</h1>
			<p class="mt-2! text-xl text-uv-text-dim">{data.post.excerpt}</p>
		</div>
	</header>

	<div class="mdx-content">
		{#if data.post.component}
			<MdxContent Component={data.post.component} />
		{/if}
	</div>
</article>

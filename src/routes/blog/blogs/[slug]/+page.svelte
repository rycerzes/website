<script lang="ts">
	let { data } = $props();
	import MdxContent from '$lib/components/MdxContent.svelte';
</script>

<article class="container mx-auto prose max-w-3xl px-4 py-12 prose-invert prose-violet">
	<header class="border-theme/30 mb-8 border-b pb-8">
		<div class="flex flex-col gap-4">
			<div class="flex items-center gap-4 font-mono text-xs text-violet-400">
				<span>{data.post.date}</span>
				<span>•</span>
				<div class="flex gap-2">
					{#each data.post.tags as tag}
						<span class="tracking-wide uppercase">#{tag}</span>
					{/each}
				</div>
			</div>

			<h1 class="!mb-0 text-4xl font-bold tracking-tight text-violet-100">{data.post.title}</h1>
			<p class="!mt-2 text-xl text-uv-text-dim">{data.post.excerpt}</p>
		</div>
	</header>

	<div class="mdx-content">
		{#if data.post.component}
			<MdxContent component={data.post.component} />
		{/if}
	</div>
</article>

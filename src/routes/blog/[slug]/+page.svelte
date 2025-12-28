<script lang="ts">
	let { data } = $props();
	let Content = $derived(data.post.component);
</script>

<article class="container mx-auto px-4 py-8 max-w-2xl">
	<header class="mb-8 border-b border-theme/20 pb-6">
		<div class="flex flex-col gap-3">
			<div
				class="flex items-center gap-3 text-[10px] font-mono text-uv-text-dim/60 uppercase tracking-widest"
			>
				<span>{data.post.date}</span>
				<span class="text-uv-text-dim/30">•</span>
				<div class="flex gap-2">
					{#each data.post.tags as tag}
						<span>#{tag}</span>
					{/each}
				</div>
			</div>

			<h1
				class="text-2xl md:text-3xl font-bold text-violet-100/90 tracking-tight !mb-0 leading-tight"
			>
				{data.post.title}
			</h1>
			<!-- <p class="text-sm text-uv-text-dim/70 !mt-2 leading-relaxed">{data.post.excerpt}</p> -->
		</div>
	</header>

	<div
		class="mdx-content prose prose-invert prose-sm max-w-none
		prose-headings:text-violet-100/90 prose-headings:font-semibold prose-headings:tracking-tight
		prose-p:text-uv-text-dim/80 prose-p:leading-7 prose-p:font-light
		prose-a:text-violet-400/80 prose-a:no-underline hover:prose-a:text-violet-300 hover:prose-a:underline
		prose-strong:text-violet-200/90 prose-strong:font-medium
		prose-code:text-violet-300/90 prose-code:bg-uv-mute/30 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-[0.8em] prose-code:before:content-none prose-code:after:content-none
		prose-pre:bg-uv-deep/50 prose-pre:border prose-pre:border-uv-mute/30
		prose-li:text-uv-text-dim/80
		prose-blockquote:text-uv-text-dim/60 prose-blockquote:border-l-violet-500/30 prose-blockquote:bg-uv-mute/10 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:not-italic
	"
	>
		<Content />
	</div>
</article>

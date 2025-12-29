<script lang="ts">
	let { data } = $props();
</script>

<div class="container mx-auto px-4 py-8 max-w-4xl">
	<div class="mb-12">
		<h1 class="text-4xl font-bold text-violet-400 font-mono mb-2">blog</h1>
		<p class="text-uv-text-dim text-sm tracking-wide">all opinions are my own</p>
	</div>

	<div class="flex flex-col gap-12">
		{#each data.posts as post}
			<a href="/blog/{post.slug}" class="group block">
				<div class="flex flex-col gap-1">
					<div class="flex items-baseline justify-between w-full">
						<h2
							class="text-xl font-medium text-uv-text group-hover:text-violet-300 transition-colors font-mono"
						>
							{post.title}
						</h2>
						<span class="text-xs text-uv-text-dim/60 font-mono shrink-0 ml-4">{post.date}</span>
					</div>

					<!-- 
					{#if post.tags.length > 0}
						<div class="flex gap-2">
							{#each post.tags as tag}
								<span class="text-xs text-uv-text-dim/50 lowercase">
									{tag}
								</span>
							{/each}
						</div>
					{/if}
					-->

					<p class="text-uv-text-dim text-sm mt-1 group-hover:text-uv-text/80 transition-colors">
						{post.excerpt}
					</p>
				</div>
			</a>
		{/each}
	</div>

	<div class="mt-20">
		<a href="/" class="text-sm text-uv-text-dim hover:text-violet-300 transition-colors font-mono">
			← back to home
		</a>
	</div>
</div>

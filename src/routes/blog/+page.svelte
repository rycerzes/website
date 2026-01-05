<script lang="ts">
	let { data } = $props();
</script>

<div class="container mx-auto max-w-4xl px-4 py-8">
	<div class="mb-12">
		<h1 class="mb-2 font-mono text-4xl font-bold text-violet-400">blog</h1>
		<p class="text-sm tracking-wide text-uv-text-dim">all opinions are my own</p>
	</div>

	<div class="flex flex-col gap-12">
		{#each data.posts as post}
			<a href="/blog/{post.slug}" class="group block">
				<div class="flex flex-col gap-1">
					<div class="flex w-full items-baseline justify-between">
						<h2
							class="text-uv-text font-mono text-xl font-medium transition-colors group-hover:text-violet-300"
						>
							{post.title}
						</h2>
						<span class="ml-4 shrink-0 font-mono text-sm text-uv-text-dim/60">{post.date}</span>
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

					<p
						class="group-hover:text-uv-text/80 mt-1 text-xs break-words text-uv-text-dim transition-colors"
					>
						{post.excerpt}
					</p>
				</div>
			</a>
		{/each}
	</div>

	<div class="mt-20">
		<a href="/" class="font-mono text-sm text-uv-text-dim transition-colors hover:text-violet-300">
			← back to home
		</a>
	</div>
</div>

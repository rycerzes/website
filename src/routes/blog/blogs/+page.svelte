<script lang="ts">
	let { data } = $props();
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="text-3xl font-bold mb-8 text-violet-200 uppercase tracking-widest">All Blogs</h1>

	<div class="grid gap-6">
		{#each data.posts as post}
			<a
				href="/blogs/{post.slug}"
				class="group block p-6 border border-theme/30 hover:bg-uv-mute/10 hover:border-violet-400 transition-all duration-300 rounded-sm"
			>
				<div class="flex flex-col gap-2">
					<div class="flex items-center justify-between">
						<h2
							class="text-xl font-bold text-uv-text group-hover:text-violet-200 transition-colors"
						>
							{post.title}
						</h2>
						<span class="text-xs text-violet-400 font-mono">{post.date}</span>
					</div>
					<p class="text-uv-text-dim text-sm">{post.excerpt}</p>
					{#if post.tags.length > 0}
						<div class="flex gap-2 mt-2">
							{#each post.tags as tag}
								<span
									class="text-[10px] uppercase tracking-wide text-violet-900 bg-violet-400/10 px-2 py-1 rounded-full"
								>
									{tag}
								</span>
							{/each}
						</div>
					{/if}
				</div>
			</a>
		{/each}
	</div>
</div>

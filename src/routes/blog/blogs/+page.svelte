<script lang="ts">
	import { resolve } from '$app/paths';

	let { data } = $props();
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="mb-8 text-3xl font-bold tracking-widest text-violet-200 uppercase">All Blogs</h1>

	<div class="grid gap-6">
		{#each data.posts as post (post.slug)}
			<a
				href={resolve('/blog/blogs/[slug]', { slug: post.slug })}
				class="group border-theme/30 block rounded-sm border p-6 transition-all duration-300 hover:border-violet-400 hover:bg-uv-mute/10"
			>
				<div class="flex flex-col gap-2">
					<div class="flex items-center justify-between">
						<h2
							class="text-uv-text text-xl font-bold transition-colors group-hover:text-violet-200"
						>
							{post.title}
						</h2>
						<span class="font-mono text-xs text-violet-400">{post.date} · {post.readingTime}</span>
					</div>
					<p class="text-sm text-uv-text-dim">{post.excerpt}</p>
					{#if post.tags.length > 0}
						<div class="mt-2 flex gap-2">
							{#each post.tags as tag (tag)}
								<span
									class="rounded-full bg-violet-400/10 px-2 py-1 text-[10px] tracking-wide text-violet-900 uppercase"
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

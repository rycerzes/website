<script lang="ts">
	import { resolve } from '$app/paths';

	let { data } = $props();
</script>

<div class="w-full py-8">
	<div class="mb-12">
		<h1 class="mb-2 font-mono text-4xl font-bold text-uv-highlight">blog</h1>
		<p class="text-sm tracking-wide text-uv-text-dim">all opinions are my own</p>
	</div>

	<div class="flex flex-col gap-12">
		{#each data.posts as post (post.slug)}
			<a href={resolve('/blog/[slug]', { slug: post.slug })} class="group block">
				<div class="flex flex-col gap-1">
					<div class="flex w-full items-baseline justify-between">
						<h2
							class="font-mono text-xl font-medium text-uv-text-main transition-colors group-hover:text-uv-highlight"
						>
							{post.title}
						</h2>
						<span class="ml-4 shrink-0 font-mono text-sm text-uv-text-dim/60">
							{post.date} · {post.readingTime}
						</span>
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
						class="mt-1 text-xs wrap-break-word text-uv-text-dim transition-colors group-hover:text-uv-text-main/80"
					>
						{post.excerpt}
					</p>
				</div>
			</a>
		{/each}
	</div>

	<div class="mt-20">
		<a
			href={resolve('/')}
			class="font-mono text-sm text-uv-text-dim transition-colors hover:text-uv-highlight"
		>
			← back to home
		</a>
	</div>
</div>

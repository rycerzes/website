<script lang="ts">
	let { data } = $props();
	import TableOfContents from '../../../components/TableOfContents.svelte';
	import MdxContent from '$lib/components/MdxContent.svelte';
</script>

<div class="relative mx-auto w-full max-w-2xl px-4 py-8">
	<!-- Left Sidebar with TOC - Hanging to the left -->
	<aside class="absolute top-0 right-full hidden h-full w-72 pr-12 lg:block">
		<div class="sticky top-32">
			<div class="mb-8">
				<a
					href="/blog"
					class="group inline-flex items-center gap-2 font-mono text-[13px] text-uv-text-dim transition-colors hover:text-violet-300"
				>
					<svg
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						class="transition-transform duration-200 group-hover:-translate-x-1"
					>
						<path
							d="M2.5 6.5H9.5C11.1569 6.5 12.5 7.84315 12.5 9.5V9.5C12.5 11.1569 11.1569 12.5 9.5 12.5H7.5M2.5 6.5L5.5 9.5M2.5 6.5L5.5 3.5"
							stroke="currentColor"
							stroke-width="1.25"
							stroke-linecap="round"
							stroke-linejoin="round"
						></path>
					</svg>
					<span>index</span>
				</a>
			</div>
			<TableOfContents />
		</div>
	</aside>

	<!-- Main Content -->
	<article class="w-full min-w-0">
		<header class="border-theme/20 relative mb-12 border-b border-dashed pb-8">
			<!-- Section Splitter visual enhancement (optional dot in middle like Chiri? User asked for general splitter) -->
			<div class="flex flex-col gap-4">
				<div
					class="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] tracking-widest text-uv-text-dim/60 uppercase"
				>
					<span>{data.post.date}</span>
					{#if data.post.tags.length > 0}
						<span class="text-uv-text-dim/30">•</span>
						<div class="flex gap-2">
							{#each data.post.tags as tag}
								<span
									class="cursor-default bg-uv-mute/30 px-1.5 py-0.5 text-[10px] font-medium tracking-wider text-uv-text-dim uppercase transition-colors hover:bg-uv-mute/50"
								>
									{tag}
								</span>
							{/each}
						</div>
					{/if}
				</div>

				<h1 class="text-3xl leading-tight font-bold tracking-tight text-violet-100/90 md:text-4xl">
					{data.post.title}
				</h1>
			</div>
		</header>

		<div
			class="mdx-content prose prose-sm max-w-none overflow-hidden prose-invert
				prose-headings:scroll-mt-24 prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-violet-100/90
				prose-p:leading-7 prose-p:font-light prose-p:text-uv-text-dim/80
				prose-a:text-violet-400/80 prose-a:underline prose-a:decoration-violet-500/30 prose-a:underline-offset-2 hover:prose-a:text-violet-300 hover:prose-a:decoration-violet-300
				prose-blockquote:border-l-violet-500/30 prose-blockquote:bg-uv-mute/10
				prose-blockquote:px-4 prose-blockquote:py-1 prose-blockquote:text-uv-text-dim/60 prose-blockquote:not-italic prose-strong:font-medium prose-strong:text-violet-200/90 prose-code:rounded prose-code:bg-uv-mute/30 prose-code:px-1
				prose-code:py-0.5 prose-code:font-mono prose-code:text-[0.8em]
				prose-code:text-violet-300/90
				prose-code:before:content-none prose-code:after:content-none prose-li:text-uv-text-dim/80
			"
		>
			<MdxContent component={data.post.component} />
		</div>
	</article>
</div>

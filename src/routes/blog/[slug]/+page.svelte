<script lang="ts">
	import { resolve } from '$app/paths';
	import TableOfContents from '../../../components/TableOfContents.svelte';
	import GiscusComments from '$lib/components/GiscusComments.svelte';
	import MdxContent from '$lib/components/MdxContent.svelte';

	let { data } = $props();
</script>

<div class="relative w-full py-8">
	<!-- Left Sidebar with TOC - Hanging to the left -->
	<aside class="absolute top-0 right-full hidden h-full w-64 pr-8 xl:block">
		<div class="sticky top-32">
			<div class="mb-8">
				<a
					href={resolve('/blog')}
					class="group inline-flex items-center gap-2 text-xs text-uv-text-dim transition-colors hover:text-uv-highlight"
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
		<header class="relative mb-12 border-b border-dashed border-uv-mute/20 pb-8">
			<!-- Section Splitter visual enhancement (optional dot in middle like Chiri? User asked for general splitter) -->
			<div class="flex flex-col gap-4">
				<div class="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-uv-text-dim">
					<span>{data.post.date}</span>
					<span class="text-uv-text-dim/30">•</span>
					<span>{data.post.readingTime}</span>
					{#if data.post.tags.length > 0}
						<span class="text-uv-text-dim/30">•</span>
						<div class="flex gap-2">
							{#each data.post.tags as tag (tag)}
								<span class="text-xs text-uv-tag">
									{tag}
								</span>
							{/each}
						</div>
					{/if}
				</div>

				<h1 class="text-xl leading-snug font-medium tracking-tight text-uv-text-main">
					{data.post.title}
				</h1>
			</div>
		</header>

		<div
			class="mdx-content prose max-w-none prose-invert
				prose-headings:scroll-mt-24 prose-headings:font-medium prose-headings:tracking-tight prose-headings:text-uv-text-main
				prose-p:text-uv-text-body
				prose-a:text-uv-link prose-a:underline prose-a:decoration-uv-link/30 prose-a:underline-offset-2 prose-blockquote:border-l-ctp-pink/40 prose-blockquote:bg-uv-mute/10
				prose-blockquote:px-4 prose-blockquote:py-1
				prose-blockquote:text-uv-text-dim/60 prose-blockquote:not-italic prose-strong:font-medium prose-strong:text-uv-text-main prose-code:rounded prose-code:bg-uv-mute/30 prose-code:px-1 prose-code:py-0.5 prose-code:font-mono
				prose-code:text-[1em] prose-code:font-normal prose-code:text-ctp-green prose-code:before:content-none
				prose-code:after:content-none
				prose-li:text-uv-text-body [&_a:hover]:text-uv-link-hover [&_a:hover]:decoration-uv-link-hover
			"
		>
			<MdxContent Component={data.post.component} />
		</div>

		<GiscusComments />
	</article>
</div>

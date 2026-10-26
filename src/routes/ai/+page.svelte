<script lang="ts">
	import { resolve } from '$app/paths';
	import TableOfContents from '../../components/TableOfContents.svelte';
</script>

<svelte:head>
	<title>How I Use (and Don't Use) AI | swappy</title>
</svelte:head>

<div class="relative w-full py-8">
	<aside class="absolute top-0 right-full hidden h-full w-72 pr-12 lg:block">
		<div class="sticky top-32">
			<div class="mb-8">
				<a
					href={resolve('/blog')}
					class="group inline-flex items-center gap-2 font-mono text-[13px] text-uv-text-dim transition-colors hover:text-uv-highlight"
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

	<article class="w-full min-w-0">
		<header class="relative mb-12 border-b border-dashed border-uv-mute/20 pb-8">
			<div class="flex flex-col gap-4">
				<div
					class="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] tracking-widest text-uv-text-dim/60 uppercase"
				>
					<span>10-08-2026</span>
					<span class="text-uv-text-dim/30">•</span>
					<span>1 min read</span>
				</div>
				<h1 class="text-3xl leading-tight font-bold tracking-tight text-uv-text-main md:text-4xl">
					How I Use (and Don't Use) AI
				</h1>
			</div>
		</header>

		<div
			class="mdx-content prose prose-sm max-w-none overflow-hidden prose-invert
				prose-headings:scroll-mt-24 prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-uv-text-main
				prose-p:leading-7 prose-p:font-light prose-p:text-uv-text-dim/80
				prose-a:text-uv-highlight prose-a:underline prose-a:decoration-uv-highlight/30 prose-a:underline-offset-2 prose-blockquote:border-l-ctp-pink/40 prose-blockquote:bg-uv-mute/10
				prose-blockquote:px-4 prose-blockquote:py-1
				prose-blockquote:text-uv-text-dim/60 prose-blockquote:not-italic prose-strong:font-medium prose-strong:text-uv-text-main prose-code:rounded prose-code:bg-uv-mute/30 prose-code:px-1 prose-code:py-0.5 prose-code:font-mono
				prose-code:text-[1em] prose-code:font-normal prose-code:text-ctp-green prose-code:before:content-none
				prose-code:after:content-none
				prose-li:text-uv-text-dim/80 [&_a:hover]:text-ctp-lavender [&_a:hover]:decoration-ctp-lavender
			"
		>
			<p>
				Everything published here begins with me. The ideas, arguments, and first draft come from my
				own experience and the work I have done, including the occasional rough edge that proves a
				person was here.
			</p>

			<p>
				Writing is how I work through an idea until I understand it. An LLM can produce competent
				prose, but it cannot contribute my point of view or replace that process of thinking. If a
				post here sounds worth reading, I want that to be because it says something I genuinely
				mean, not because a model made it sound polished.
			</p>

			<p>
				I do not treat AI as forbidden. Once I have a draft, I sometimes use it as a light
				copy-editing tool: to spot an awkward sentence, test whether a point is clear, or find a
				better word. The result should still feel like that greninja I raised myself: shaped through
				the actual grind, quirks and all, rather than traded in fully levelled.
			</p>

			<h2 id="what-i-use-ai-for">What I Use AI For</h2>
			<ul>
				<li>Checking grammar, spelling, and phrasing</li>
				<li>
					Suggesting alternative wording. As a non-native English speaker, I value the extra
					vocabulary without letting it flatten my voice
				</li>
				<li>
					Sanity-checking whether an article's argument follows clearly from one point to the next
				</li>
				<li>
					Brainstorming titles, teasers, tags, and small improvements to the site, which I rework to
					fit my own voice
				</li>
			</ul>

			<h2 id="what-i-do-not-use-ai-for">What I Do Not Use AI For</h2>
			<ul>
				<li>Generating the original ideas, perspectives, or conclusions in a post</li>
				<li>Writing a first draft or complete paragraphs and sections for publication</li>
			</ul>

			<h2 id="references">References</h2>
			<p>These AI disclosures helped shape how I think about this policy:</p>
			<ul>
				<li>
					<a href="https://www.morling.dev/ai/">Gunnar Morling - How I Use (and Don't Use) AI</a>
				</li>
				<li><a href="https://vickiboykis.com/ai/">Vicki Boykis - AI</a></li>
				<li><a href="https://junaid.foo/ai/">Junaid Rahim - AI Disclosure</a></li>
			</ul>
		</div>
	</article>
</div>

<script lang="ts">
	import { onMount } from 'svelte';

	let headings: { id: string; text: string; level: number }[] = $state([]);
	let activeId = $state('');

	onMount(() => {
		// Find all headings in the article content
		const elements = Array.from(document.querySelectorAll('.mdx-content h2, .mdx-content h3'));

		headings = elements.map((elem) => {
			if (!elem.id) {
				// Generate id if missing
				elem.id =
					elem.textContent
						?.toLowerCase()
						.replace(/[^a-z0-9]+/g, '-')
						.replace(/(^-|-$)/g, '') || '';
			}
			return {
				id: elem.id,
				text: elem.textContent || '',
				level: Number(elem.tagName.substring(1))
			};
		});

		// Scroll spy
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						activeId = entry.target.id;
					}
				});
			},
			{ rootMargin: '0px 0px -80% 0px' }
		);

		elements.forEach((elem) => observer.observe(elem));

		return () => observer.disconnect();
	});
</script>

{#if headings.length > 0}
	<nav class="toc-nav relative flex flex-col gap-1">
		<!-- Header removed for minimal Chiri style -->
		{#each headings as heading}
			<a
				href="#{heading.id}"
				class="group flex items-start py-1 transition-colors hover:text-violet-300 {activeId ===
				heading.id
					? 'active'
					: ''}"
				aria-label={heading.text}
			>
				<!-- The Line -->
				<div
					class="mt-2 h-px w-6 shrink-0 bg-uv-text-dim/30 transition-all duration-200 ease-out group-hover:w-2 group-hover:bg-violet-300 group-hover:opacity-100 group-[.active]:w-8 group-[.active]:bg-violet-400 group-[.active]:opacity-80"
					style="background-color: var(--color-uv-text-dim); opacity: 0.3;"
				></div>

				<!-- The Text -->
				<span
					class="ml-3 block -translate-x-2 font-mono text-xs text-uv-text-dim opacity-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0 group-hover:opacity-100"
					style="font-family: var(--font-family-mono); color: var(--color-uv-text-dim);"
				>
					{heading.text}
				</span>
			</a>
		{/each}
	</nav>
{/if}

<style>
	/* Using style attributes for variables where possible, but overriding specific interactions here if needed */
	/* Re-enforcing active styles since Tailwind v4 arbitrary variants might be finicky with custom classes if not configured perfectly */

	a.active div {
		width: 2rem !important;
		background-color: var(--color-uv-highlight) !important;
		opacity: 0.8 !important;
	}

	a:hover div {
		width: 0.5rem !important;
		background-color: #c4b5fd !important;
		opacity: 1 !important;
	}
</style>

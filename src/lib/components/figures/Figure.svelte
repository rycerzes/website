<script lang="ts">
	import type { Component, Snippet } from 'svelte';

	type Props = {
		/** Caption rendered below the figure. Describes what the reader is looking at. */
		caption?: string;
		/**
		 * Height in px reserved before the figure mounts, so hydration and lazy
		 * reveal cause no layout shift. Match the figure's own resting height.
		 */
		height: number;
		/**
		 * Defer mounting until the figure is near the viewport. Leave on for anything
		 * below the fold; turn off for a figure high enough to be visible immediately.
		 */
		lazy?: boolean;
		/**
		 * Optional dynamic import, e.g. `() => import('./CoordinateBins.svelte')`.
		 * When given, the module is fetched only once visible, so the figure's code
		 * splits out of the initial bundle. Otherwise pass the figure as children.
		 */
		load?: () => Promise<{ default: Component<Record<string, never>> }>;
		children?: Snippet;
	};

	let { caption, height, lazy = true, load, children }: Props = $props();

	let container = $state<HTMLElement | null>(null);
	let visible = $state(!lazy);

	$effect(() => {
		if (visible || !container) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					visible = true;
					observer.disconnect();
				}
			},
			// start work slightly before it scrolls into view
			{ rootMargin: '200px' }
		);

		observer.observe(container);
		return () => observer.disconnect();
	});
</script>

<figure bind:this={container} class="figure-literal not-prose my-8">
	<div class="overflow-hidden border border-uv-mute/40 bg-uv-deep" style="min-height: {height}px">
		{#if visible}
			{#if load}
				{#await load() then module}
					{@const Loaded = module.default}
					<Loaded />
				{/await}
			{:else if children}
				{@render children()}
			{/if}
		{/if}
	</div>

	{#if caption}
		<figcaption class="mt-2 font-mono text-[11px] leading-relaxed text-uv-text-dim/70">
			{caption}
		</figcaption>
	{/if}
</figure>

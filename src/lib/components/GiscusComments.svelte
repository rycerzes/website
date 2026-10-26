<script lang="ts">
	import { onMount } from 'svelte';
	import { version } from '$app/environment';

	let mounted = $state(false);
	let themeUrl = $state('');

	onMount(() => {
		// The stylesheet is cached for hours at the edge and in the browser; a per-build
		// query makes a theme change land on deploy.
		themeUrl = `${window.location.origin}/assets/giscus-theme.css?v=${version}`;
		mounted = true;
	});
</script>

<section class="mt-16 border-t border-dashed border-uv-mute/20 pt-10">
	<div class="mb-6">
		<h2 class="font-mono text-sm tracking-widest text-ctp-subtext1 uppercase">comments</h2>
		<p class="mt-2 text-sm text-uv-text-dim/70">
			Reactions and discussion are powered by
			<a
				href="https://giscus.app"
				target="_blank"
				rel="noreferrer"
				class="text-uv-highlight underline decoration-uv-highlight/30 underline-offset-2 transition-colors hover:text-ctp-lavender hover:decoration-ctp-lavender"
			>
				giscus</a
			>
		</p>
	</div>

	<div class="giscus min-h-32">
		{#if mounted && themeUrl}
			<script
				src="https://giscus.app/client.js"
				data-repo="rycerzes/website"
				data-repo-id="R_kgDOQWnjDg"
				data-category="Blog comments"
				data-category-id="DIC_kwDOQWnjDs4DAhwp"
				data-mapping="pathname"
				data-strict="1"
				data-reactions-enabled="1"
				data-emit-metadata="1"
				data-input-position="bottom"
				data-theme={themeUrl}
				data-lang="en"
				data-loading="lazy"
				crossorigin="anonymous"
				async
			></script>
		{/if}
	</div>
</section>

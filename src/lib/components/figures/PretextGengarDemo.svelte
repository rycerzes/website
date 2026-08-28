<script lang="ts">
	import { onMount } from 'svelte';
	import { mountPretextgengarDemo } from './pretextDemo.js';

	let stageEl: HTMLDivElement;
	let linesEl: HTMLDivElement;
	let spriteEl: HTMLDivElement;
	let spriteInnerEl: HTMLDivElement;

	onMount(() => mountPretextgengarDemo(stageEl, linesEl, spriteEl, spriteInnerEl));
</script>

<div class="not-prose my-8 overflow-hidden border border-uv-mute/40 bg-[#0c0a10]">
	<div
		class="border-b border-uv-mute/30 bg-[#120f1a] px-4 py-2 font-mono text-[11px] tracking-wide text-uv-text-dim/80 uppercase"
	>
		demo
	</div>

	<div
		bind:this={stageEl}
		role="img"
		aria-label="Pretext line routing demo with a cursor-following gengar sprite"
		class="relative h-[520px] w-full overflow-hidden bg-[radial-gradient(ellipse_at_50%_30%,#181326_0%,#0d0a14_55%,#07060b_100%)]"
	>
		<div bind:this={linesEl} class="pointer-events-none absolute inset-0 z-10"></div>

		<div bind:this={spriteEl} class="absolute z-20">
			<div
				bind:this={spriteInnerEl}
				class="image-render-pixel h-full w-full bg-no-repeat"
				style=""
			></div>
		</div>
	</div>
</div>

<script lang="ts">
	import { onMount } from 'svelte';
	import { accent, border, series, text as ink } from '$lib/palette';
	import { beamData } from '$lib/figures/insideBeam';

	type Routes = {
		layers: number[];
		efforts: number[];
		questions: string[];
		routes: Record<string, number[][][]>; // effort -> question -> layer -> 8 experts
	};
	const data = beamData<Routes>('routes');
	const BASE = '8';

	let width = $state(0);
	let q = $state(0);
	let ei = $state(data.efforts.indexOf(512));
	let playing = $state(false);

	const effort = $derived(String(data.efforts[ei]));
	const route = $derived(data.routes[effort][q]);
	const base = $derived(data.routes[BASE][q]);
	const changed = $derived(route.map((r, l) => r.filter((e) => !base[l].includes(e)).length));
	const total = $derived(changed.reduce((a, b) => a + b, 0));

	const PAD = { l: 26, r: 6, t: 6, b: 52 };
	const ROWS = 256;
	const H = 300;
	const plotW = $derived(Math.max(0, width - 32 - PAD.l - PAD.r));
	const colW = $derived(plotW / data.layers.length);
	const rowH = (H - PAD.t - PAD.b) / ROWS;
	const cx = (l: number) => PAD.l + (l + 0.5) * colW;
	const cy = (e: number) => PAD.t + (e + 0.5) * rowH;

	let timer = 0;
	$effect(() => {
		if (!playing) return;
		timer = window.setInterval(() => {
			ei = (ei + 1) % data.efforts.length;
		}, 1100);
		return () => window.clearInterval(timer);
	});

	onMount(() => {
		if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			ei = data.efforts.indexOf(8);
			playing = true;
		}
	});

	const btn =
		'border px-2 py-1 transition-colors focus-visible:outline-2 focus-visible:outline-uv-highlight';
</script>

<div class="flex flex-col gap-3 p-4 font-mono text-[11px]" bind:clientWidth={width}>
	<div class="flex flex-wrap items-center gap-2">
		{#each data.questions as _, i (i)}
			<button
				type="button"
				aria-pressed={q === i}
				onclick={() => (q = i)}
				class="{btn} {q === i
					? 'border-uv-highlight bg-uv-raised text-uv-text-main'
					: 'border-uv-border text-uv-text-dim/70 hover:text-uv-text-main'}"
				>question {i + 1}</button
			>
		{/each}
		<button
			type="button"
			aria-pressed={playing}
			onclick={() => (playing = !playing)}
			class="{btn} ml-auto {playing
				? 'border-uv-highlight bg-uv-raised text-uv-text-main'
				: 'border-uv-border text-uv-text-dim/70 hover:text-uv-text-main'}"
			>{playing ? 'pause' : 'play'}</button
		>
	</div>
	<p class="line-clamp-2 leading-relaxed text-uv-text-dim/60 normal-case">
		{data.questions[q]}
	</p>

	{#if width > 0}
		<svg
			width="100%"
			height={H}
			viewBox="0 0 {width - 32} {H}"
			role="img"
			aria-label="The 8 experts chosen at each of 49 MoE layers for the token that opens Beam's thinking, at reasoning effort {effort}. {total} of 392 choices differ from effort 8."
		>
			{#each Array.from({ length: 8 }, (_, g) => g) as g (g)}
				<rect
					x={PAD.l}
					y={PAD.t + g * 32 * rowH}
					width={plotW}
					height={32 * rowH}
					fill={g % 2 ? 'transparent' : border.subtle}
					opacity="0.35"
				/>
			{/each}
			<text x={PAD.l - 4} y={PAD.t + 8} font-size="9" text-anchor="end" fill={ink.dim}>e0</text>
			<text x={PAD.l - 4} y={H - PAD.b} font-size="9" text-anchor="end" fill={ink.dim}>e255</text>
			{#each data.layers as layer, l (layer)}
				{#each base[l] as e (e)}
					{#if !route[l].includes(e)}
						<circle cx={cx(l)} cy={cy(e)} r="2.6" fill="none" stroke={ink.dim} opacity="0.6" />
					{/if}
				{/each}
				{#each route[l] as e (e)}
					{@const kept = base[l].includes(e)}
					<circle
						class="dot"
						cx={cx(l)}
						cy={cy(e)}
						r={kept ? 2.4 : 3.2}
						fill={kept ? series.blue : accent}
					/>
				{/each}
				<rect
					x={cx(l) - colW * 0.35}
					y={H - PAD.b + 24 - changed[l] * 5}
					width={colW * 0.7}
					height={changed[l] * 5}
					fill={accent}
				/>
			{/each}
			{#each [3, 15, 27, 39, 51] as layer (layer)}
				<text x={cx(layer - 3)} y={H - PAD.b + 40} font-size="9" text-anchor="middle" fill={ink.dim}
					>L{layer}</text
				>
			{/each}
		</svg>
	{/if}

	<div class="flex items-center gap-3">
		<label for="route-effort" class="w-24 shrink-0 text-uv-text-dim/70">effort {effort}</label>
		<input
			id="route-effort"
			type="range"
			min="0"
			max={data.efforts.length - 1}
			step="1"
			bind:value={ei}
			oninput={() => (playing = false)}
			class="h-1 w-full cursor-pointer appearance-none bg-uv-mute accent-uv-highlight"
		/>
	</div>
	<p class="min-h-[2.5rem] leading-relaxed text-uv-text-dim/70">
		Blue: experts also chosen at effort 8. Mauve: experts this effort brings in; hollow rings: the
		ones it drops. Bars under each layer count the swaps. At effort {effort},
		<span class="text-uv-text-main">{total} of 392</span> choices differ from effort 8 for this token.
	</p>
</div>

<style>
	.dot {
		transition: cy 300ms ease-out;
	}

	@media (prefers-reduced-motion: reduce) {
		.dot {
			transition: none;
		}
	}
</style>

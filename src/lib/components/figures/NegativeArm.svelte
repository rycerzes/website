<script lang="ts">
	import { series, text as ink, border } from '$lib/palette';

	// End-to-end results for min_run 8 (shipped) and min_run 3, same index, ranker refit for each.
	type Metric = { label: string; a: number; b: number; lowerIsBetter: boolean; arm: boolean };
	const metrics: Metric[] = [
		{ label: 'prevalence R@1', a: 0.977, b: 0.9807, lowerIsBetter: false, arm: false },
		{ label: 'prevalence coverage', a: 0.9916, b: 0.9988, lowerIsBetter: false, arm: false },
		{ label: 'DEP-5 R@1', a: 0.8718, b: 0.8838, lowerIsBetter: false, arm: false },
		{ label: 'DEP-5 no-signal files answered', a: 0.061, b: 0.48, lowerIsBetter: true, arm: true },
		{ label: 'bespoke files answered', a: 0.49, b: 0.881, lowerIsBetter: true, arm: true }
	];

	let showArm = $state(false);
	const shown = $derived(metrics.filter((m) => showArm || !m.arm));

	const ROW_H = 44;
	const PAD_L = 8;
	const PAD_R = 56;

	let width = $state(0);
	const plotW = $derived(Math.max(0, width - PAD_L - PAD_R));
	const svgH = $derived(shown.length * ROW_H + 6);
	const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
</script>

<div class="flex flex-col gap-3 p-4" bind:clientWidth={width}>
	<div class="flex flex-wrap items-center gap-4 font-mono text-[11px] text-uv-text-dim/70">
		<span class="flex items-center gap-1.5">
			<svg width="10" height="10" aria-hidden="true"
				><rect x="1" y="1" width="8" height="8" rx="2" fill={series.blue} /></svg
			> min_run 8 (shipped)
		</span>
		<span class="flex items-center gap-1.5">
			<svg width="10" height="10" aria-hidden="true"
				><rect x="1" y="1" width="8" height="8" rx="2" fill={series.orange} /></svg
			> min_run 3
		</span>
		<button
			type="button"
			aria-pressed={showArm}
			onclick={() => (showArm = !showArm)}
			class="ml-auto border px-2 py-1 transition-colors focus-visible:outline-2 focus-visible:outline-uv-highlight {showArm
				? 'border-uv-highlight bg-uv-raised text-uv-text-main'
				: 'border-uv-border text-uv-text-dim/70 hover:text-uv-text-main'}"
		>
			{showArm ? 'hide' : 'add'} the no-signal arm
		</button>
	</div>

	{#if width > 0}
		<svg
			width="100%"
			height={svgH}
			viewBox="0 0 {width} {svgH}"
			role="img"
			aria-label={showArm
				? 'With the no-signal arm: min_run 3 raises prevalence R@1 to 0.981 and DEP-5 R@1 to 0.884, but answers 48% of files with no license text, up from 6.1%, and 88% of bespoke files, up from 49%.'
				: 'Without a no-signal arm, min_run 3 beats the shipped min_run 8 on every metric: prevalence R@1 0.981 vs 0.977, coverage 0.999 vs 0.992, DEP-5 R@1 0.884 vs 0.872.'}
		>
			{#each shown as m, i (m.label)}
				{@const y = i * ROW_H + 4}
				<text x={PAD_L} y={y + 9} font-size="11" fill={m.arm ? ink.primary : ink.dim}
					>{m.label}{m.lowerIsBetter ? ' (lower is better)' : ''}</text
				>
				{#each [m.a, m.b] as v, j (j)}
					<rect
						x={PAD_L}
						y={y + 15 + j * 12}
						width={plotW}
						height="9"
						fill={border.subtle}
						opacity="0.3"
					/>
					<rect
						x={PAD_L}
						y={y + 15 + j * 12}
						width={Math.max(v * plotW, 2)}
						height="9"
						rx="2"
						fill={j === 0 ? series.blue : series.orange}
					/>
					<text x={PAD_L + plotW + 6} y={y + 23 + j * 12} font-size="10" fill={ink.primary}
						>{m.lowerIsBetter ? pct(v) : v.toFixed(3)}</text
					>
				{/each}
			{/each}
		</svg>
	{/if}

	<p class="min-h-[3rem] font-mono text-[11px] leading-relaxed text-uv-text-dim/70">
		{#if showArm}
			The "better" setting answers
			<span class="unit text-uv-text-main">48%</span> of files that contain no license at all. Reverted.
		{:else}
			Scored only on files that have an answer, min_run 3 wins everywhere. This is the sweep that
			would have shipped.
		{/if}
	</p>
</div>

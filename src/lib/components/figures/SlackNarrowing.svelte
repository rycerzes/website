<script lang="ts">
	import { series, text as ink, border } from '$lib/palette';

	// How much unaccounted time a forgery could hide in, as a multiple of the claimed work.
	const stages = [
		{
			label: 'whole-process wall time',
			slack: 43,
			note: 'seconds of torch import and float64 reference, all of it spendable'
		},
		{
			label: 'supervisor-timed loops',
			slack: 4.6,
			note: 'a byte either side of every loop, on a descriptor the supervisor owns'
		},
		{
			label: '+ counting inner_iters',
			slack: 1.2,
			note: 'median_ms is per launch; each sample batches inner_iters'
		}
	];

	const ROW_H = 40;
	const PAD_L = 8;
	const PAD_R = 54;
	const MIN = 1,
		MAX = 50;

	let width = $state(0);
	const plotW = $derived(Math.max(0, width - PAD_L - PAD_R));
	// log scale: 43x and 1.2x are unreadable together on a linear axis
	const w = $derived(
		(v: number) => ((Math.log10(v) - Math.log10(MIN)) / (Math.log10(MAX) - Math.log10(MIN))) * plotW
	);
	const svgH = stages.length * ROW_H + 26;
</script>

<div class="flex flex-col gap-2 p-4" bind:clientWidth={width}>
	{#if width > 0}
		<svg
			width="100%"
			height={svgH}
			viewBox="0 0 {width} {svgH}"
			role="img"
			aria-label="Slack in the provenance bound, on a log scale: whole-process wall time left 43 times the claimed work unaccounted for; timing the loops from the supervisor cut it to 4.6; counting inner iterations cut it to 1.2."
		>
			{#each [1, 5, 10, 50] as t (t)}
				<line
					x1={PAD_L + w(t)}
					y1="0"
					x2={PAD_L + w(t)}
					y2={stages.length * ROW_H}
					stroke={border.subtle}
					stroke-width="1"
				/>
				<text
					x={PAD_L + w(t)}
					y={stages.length * ROW_H + 16}
					font-size="10"
					text-anchor="middle"
					fill={ink.dim}
					opacity="0.55">{t}×</text
				>
			{/each}

			{#each stages as s, i (s.label)}
				{@const y = i * ROW_H + 8}
				<text x={PAD_L} y={y + 2} font-size="11" fill={ink.dim}>{s.label}</text>
				<!-- one series, so one hue; length carries the magnitude, not colour -->
				<rect
					x={PAD_L}
					y={y + 8}
					width={Math.max(w(s.slack), 2)}
					height="10"
					rx="3"
					fill={series.blue}
				/>
				<text x={PAD_L + Math.max(w(s.slack), 2) + 8} y={y + 17} font-size="11" fill={ink.primary}>
					{s.slack}×
				</text>
			{/each}
		</svg>
	{/if}
	<p class="min-h-[2.5rem] font-mono text-[11px] leading-relaxed text-uv-text-dim/70">
		Log scale — 43× and 1.2× do not share a linear axis usefully. Each step moves the clock further
		from the code being measured.
	</p>
</div>

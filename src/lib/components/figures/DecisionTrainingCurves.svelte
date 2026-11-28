<script lang="ts">
	import { accent, border, series, text as ink } from '$lib/palette';
	import { TOTAL_STEPS, linear, pct, training, type TrainingRow } from '$lib/figures/decisionModel';

	type Panel = {
		key: keyof Omit<TrainingRow, 'step'>;
		name: string;
		lo: number;
		hi: number;
		ticks: number[];
		fmt: (v: number) => string;
	};

	const panels: Panel[] = [
		{
			key: 'loss',
			name: 'loss',
			lo: 0.5,
			hi: 1,
			ticks: [0.5, 0.75, 1],
			fmt: (v) => v.toFixed(2)
		},
		{
			key: 'accuracy',
			name: 'accuracy',
			lo: 0.55,
			hi: 0.8,
			ticks: [0.6, 0.7, 0.8],
			fmt: (v) => pct(v)
		},
		{
			key: 'brier',
			name: 'brier',
			lo: 0.25,
			hi: 0.5,
			ticks: [0.3, 0.4, 0.5],
			fmt: (v) => v.toFixed(2)
		}
	];

	const PANEL_H = 92;
	// Each panel's name sits above its frame, in the gap
	const GAP = 26;
	const AXIS = 26;
	const PAD = { l: 44, r: 12, t: 20 };
	const H = PAD.t + panels.length * PANEL_H + (panels.length - 1) * GAP + AXIS;

	let width = $state(0);
	let index = $state(training.length - 1);

	const innerW = $derived(Math.max(0, width - 32));
	const x = $derived(linear(0, TOTAL_STEPS, PAD.l, Math.max(PAD.l + 1, innerW - PAD.r)));
	const top = (i: number) => PAD.t + i * (PANEL_H + GAP);
	const yOf = (p: Panel, i: number) => linear(p.lo, p.hi, top(i) + PANEL_H, top(i));

	const row = $derived(training[index]);

	function path(p: Panel, i: number, sx: (v: number) => number): string {
		const y = yOf(p, i);
		return training
			.map((r, j) => `${j ? 'L' : 'M'}${sx(r.step).toFixed(1)},${y(r[p.key]).toFixed(1)}`)
			.join('');
	}

	function onPointer(event: PointerEvent) {
		const svg = event.currentTarget as SVGSVGElement;
		const box = svg.getBoundingClientRect();
		const px = ((event.clientX - box.left) / box.width) * innerW;
		let best = 0;
		for (let j = 1; j < training.length; j++) {
			if (Math.abs(x(training[j].step) - px) < Math.abs(x(training[best].step) - px)) best = j;
		}
		index = best;
	}

	const id = $props.id();
</script>

<div class="flex flex-col gap-3 p-4" bind:clientWidth={width}>
	<p class="font-mono text-[11px] text-uv-text-dim" aria-live="polite">
		<span class="text-uv-text-main">step {row.step}</span>
		<span class="mx-1 text-uv-text-dim/50">·</span>loss
		<span class="text-uv-text-main">{row.loss.toFixed(3)}</span>
		<span class="mx-1 text-uv-text-dim/50">·</span>accuracy
		<span class="text-uv-text-main">{pct(row.accuracy, 1)}</span>
		<span class="mx-1 text-uv-text-dim/50">·</span>brier
		<span class="text-uv-text-main">{row.brier.toFixed(3)}</span>
	</p>

	{#if innerW > 0}
		<svg
			width="100%"
			height={H}
			viewBox="0 0 {innerW} {H}"
			role="img"
			aria-label="Training curves over {TOTAL_STEPS} steps, logged every 25: loss from {training[0].loss.toFixed(
				2
			)} to {training[training.length - 1].loss.toFixed(2)}, accuracy from {pct(
				training[0].accuracy
			)} to {pct(training[training.length - 1].accuracy)}, Brier from {training[0].brier.toFixed(
				2
			)} to {training[training.length - 1].brier.toFixed(2)}. Selected: step {row.step}."
			onpointermove={onPointer}
			onpointerdown={onPointer}
			class="touch-none"
		>
			{#each panels as p, i (p.key)}
				{@const y = yOf(p, i)}
				<rect
					x={PAD.l}
					y={top(i)}
					width={Math.max(0, innerW - PAD.r - PAD.l)}
					height={PANEL_H}
					fill="none"
					stroke={border.subtle}
				/>
				{#each p.ticks as t (t)}
					<line x1={PAD.l} x2={innerW - PAD.r} y1={y(t)} y2={y(t)} stroke={border.subtle} />
					<text x={PAD.l - 6} y={y(t) + 3.5} font-size="10" text-anchor="end" fill={ink.dim}
						>{p.fmt(t)}</text
					>
				{/each}
				<text x={PAD.l} y={top(i) - 7} font-size="11" fill={ink.primary}>{p.name}</text>
				<path d={path(p, i, x)} fill="none" stroke={series.blue} stroke-width="1.5" />
				<circle cx={x(row.step)} cy={y(row[p.key])} r="3" fill={series.blue} />
			{/each}

			<line
				x1={x(row.step)}
				x2={x(row.step)}
				y1={PAD.t}
				y2={H - AXIS}
				stroke={accent}
				stroke-dasharray="3 3"
			/>

			{#each [0, 200, 400, 600, 800, TOTAL_STEPS] as s (s)}
				<text x={x(s)} y={H - 8} font-size="10" text-anchor="middle" fill={ink.dim}>{s}</text>
			{/each}
		</svg>
	{/if}

	<div class="flex items-center gap-3 font-mono text-[11px] text-uv-text-dim">
		<label for="{id}-step" class="shrink-0">step</label>
		<input
			id="{id}-step"
			type="range"
			min="0"
			max={training.length - 1}
			step="1"
			bind:value={index}
			class="w-full accent-(--color-uv-highlight) focus-visible:outline-2 focus-visible:outline-uv-highlight"
		/>
	</div>
</div>

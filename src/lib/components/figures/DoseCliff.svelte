<script lang="ts">
	import { accent, border, text as ink } from '$lib/palette';
	import { beamData, depthColour, logScale } from '$lib/figures/insideBeam';

	type Calib = { doses: number[]; tau: number; dnll: number[][] };
	const calib = beamData<Calib>('calib');

	let width = $state(0);
	let layer = $state(30);

	const PAD = { l: 44, r: 16, t: 24, b: 34 };
	const H = 260;
	const plotW = $derived(Math.max(0, width - 32 - PAD.l - PAD.r));
	const x = $derived(logScale(0.05, 1.2, PAD.l, PAD.l + plotW));
	const y = logScale(0.001, 10, PAD.t + H - PAD.t - PAD.b, PAD.t);

	const path = (vals: number[]) =>
		vals
			.map((v, i) => `${i ? 'L' : 'M'}${x(calib.doses[i]).toFixed(1)},${y(v).toFixed(1)}`)
			.join('');

	const row = $derived(calib.dnll[layer]);
	// the largest dose whose ΔNLL stays under τ*: where the cliff starts for this layer
	const edge = $derived.by(() => {
		let last = calib.doses[0];
		row.forEach((v, i) => {
			if (v <= calib.tau) last = calib.doses[i];
		});
		return last;
	});
</script>

<div class="flex flex-col gap-3 p-4" bind:clientWidth={width}>
	{#if width > 0}
		<svg
			width="100%"
			height={H}
			viewBox="0 0 {width - 32} {H}"
			role="img"
			aria-label="Change in Beam's log-likelihood of its own answers when a random direction is added to the residual, against dose, for every layer. Layer {layer}: {row
				.map((v, i) => `${calib.doses[i]}× → ${v.toFixed(3)}`)
				.join(', ')} nats per token."
		>
			{#each [0.001, 0.01, 0.1, 1, 10] as t (t)}
				<line x1={PAD.l} x2={PAD.l + plotW} y1={y(t)} y2={y(t)} stroke={border.subtle} />
				<text x={PAD.l - 6} y={y(t) + 3.5} font-size="10" text-anchor="end" fill={ink.dim}>{t}</text
				>
			{/each}
			{#each calib.doses as d (d)}
				<text x={x(d)} y={H - PAD.b + 16} font-size="10" text-anchor="middle" fill={ink.dim}
					>{d}×</text
				>
			{/each}
			<text x={PAD.l + plotW} y={H - 4} font-size="10" text-anchor="end" fill={ink.dim}
				>dose (× median residual norm)</text
			>
			<text x={4} y={10} font-size="10" fill={ink.dim}>ΔNLL (nats/token)</text>

			<line
				x1={PAD.l}
				x2={PAD.l + plotW}
				y1={y(calib.tau)}
				y2={y(calib.tau)}
				stroke={accent}
				stroke-dasharray="4 3"
			/>
			<text x={PAD.l + 4} y={y(calib.tau) - 5} font-size="10" fill={accent}
				>τ* = {calib.tau.toFixed(2)}: largest coherent effect</text
			>

			{#each calib.dnll as vals, l (l)}
				{#if l !== layer}
					<path d={path(vals)} fill="none" stroke={depthColour(l)} stroke-opacity="0.18" />
				{/if}
			{/each}
			<path d={path(row)} fill="none" stroke={depthColour(layer)} stroke-width="2.5" />
			{#each row as v, i (i)}
				<circle cx={x(calib.doses[i])} cy={y(v)} r="3" fill={depthColour(layer)} />
			{/each}
		</svg>
	{/if}

	<div class="flex items-center gap-3">
		<label for="dose-layer" class="w-20 shrink-0 font-mono text-[11px] text-uv-text-dim/70"
			>layer {layer}</label
		>
		<input
			id="dose-layer"
			type="range"
			min="0"
			max="51"
			step="1"
			bind:value={layer}
			class="h-1 w-full cursor-pointer appearance-none bg-uv-mute accent-uv-highlight"
		/>
	</div>
	<p class="min-h-[2.5rem] font-mono text-[11px] leading-relaxed text-uv-text-dim/70">
		Layer {layer}{layer < 3 ? ' (dense)' : ''}: <span class="normal-case">ΔNLL</span> stays under τ*
		up to
		<span class="text-uv-text-main">{edge}×</span> the median residual norm. One dose step later it is
		usually an order of magnitude higher. Faint lines are the other 51 layers, teal early through blue
		and pink to peach late.
	</p>
</div>

<script lang="ts">
	import { series, semantic, text as ink, border } from '$lib/palette';

	/** RTX 4090 figures the harness measures against, as quoted in the post. */
	const BW_TB_S = 1.008; // 1008 GB/s -> TFLOP/s per FLOP/byte
	const PEAK_FP32 = 83.1; // TFLOP/s
	const FORGED = 100.9; // what the bf16-in-fp32-clothing candidate reported
	const ridge = PEAK_FP32 / BW_TB_S; // FLOP/byte where the roofs meet

	const X_MIN = 0.5,
		X_MAX = 2000,
		Y_MIN = 0.4,
		Y_MAX = 260;
	const PAD_L = 46,
		PAD_R = 16,
		PAD_T = 14,
		PAD_B = 34;
	const PLOT_H = 210;

	let width = $state(0);
	let intensity = $state(8);

	const plotW = $derived(Math.max(0, width - PAD_L - PAD_R));
	const lx = (v: number) => Math.log10(v);
	const px = $derived((v: number) => ((lx(v) - lx(X_MIN)) / (lx(X_MAX) - lx(X_MIN))) * plotW);
	const py = (v: number) => PLOT_H - ((lx(v) - lx(Y_MIN)) / (lx(Y_MAX) - lx(Y_MIN))) * PLOT_H;

	const ceiling = $derived(Math.min(BW_TB_S * intensity, PEAK_FP32));
	const bound = $derived(intensity < ridge ? 'memory' : 'compute');

	const roofPath = $derived.by(() => {
		const pts: string[] = [];
		for (let i = 0; i <= 60; i++) {
			const v = X_MIN * Math.pow(X_MAX / X_MIN, i / 60);
			pts.push(`${px(v)},${py(Math.min(BW_TB_S * v, PEAK_FP32))}`);
		}
		return 'M ' + pts.join(' L ');
	});

	const xTicks = [1, 10, 100, 1000];
	const yTicks = [1, 10, 100];
</script>

<div class="flex flex-col gap-3 p-4" bind:clientWidth={width}>
	{#if width > 0}
		<svg
			width="100%"
			height={PLOT_H + PAD_T + PAD_B}
			viewBox="0 0 {width} {PLOT_H + PAD_T + PAD_B}"
			role="img"
			aria-label="Roofline for an RTX 4090 at fp32: a 1008 GB/s memory roof rising to an 83.1 TFLOP/s compute roof, meeting at {ridge.toFixed(
				0
			)} FLOP per byte. At {intensity.toFixed(
				1
			)} FLOP per byte the binding ceiling is {ceiling.toFixed(
				1
			)} TFLOP/s and the kernel is {bound}-bound. A forged candidate reported 100.9 TFLOP/s, above the compute roof at every intensity."
		>
			<g transform="translate({PAD_L}, {PAD_T})">
				{#each xTicks as t (t)}
					<line x1={px(t)} y1="0" x2={px(t)} y2={PLOT_H} stroke={border.subtle} stroke-width="1" />
					<text
						x={px(t)}
						y={PLOT_H + 15}
						font-size="10"
						text-anchor="middle"
						fill={ink.dim}
						opacity="0.55">{t}</text
					>
				{/each}
				{#each yTicks as t (t)}
					<line x1="0" y1={py(t)} x2={plotW} y2={py(t)} stroke={border.subtle} stroke-width="1" />
					<text
						x="-8"
						y={py(t) + 3.5}
						font-size="10"
						text-anchor="end"
						fill={ink.dim}
						opacity="0.55">{t}</text
					>
				{/each}

				<!-- the region no fp32 kernel can enter -->
				<rect
					x="0"
					y="0"
					width={plotW}
					height={py(PEAK_FP32)}
					fill={semantic.fail}
					opacity="0.07"
				/>
				<line
					x1="0"
					y1={py(FORGED)}
					x2={plotW}
					y2={py(FORGED)}
					stroke={semantic.fail}
					stroke-width="2"
					stroke-dasharray="4 3"
				/>
				<text x={plotW - 4} y={py(FORGED) - 6} font-size="10" text-anchor="end" fill={ink.primary}>
					forged claim 100.9 — above the roof everywhere
				</text>

				<path d={roofPath} fill="none" stroke={series.blue} stroke-width="2" />
				<circle
					cx={px(ridge)}
					cy={py(PEAK_FP32)}
					r="3.5"
					fill={series.blue}
					stroke="var(--color-uv-deep)"
					stroke-width="2"
				/>
				<text x={px(ridge) + 8} y={py(PEAK_FP32) + 14} font-size="10" fill={ink.dim}>
					ridge {ridge.toFixed(0)} FLOP/byte
				</text>

				<line
					x1={px(intensity)}
					y1="0"
					x2={px(intensity)}
					y2={PLOT_H}
					stroke={series.orange}
					stroke-width="1.5"
				/>
				<circle
					cx={px(intensity)}
					cy={py(ceiling)}
					r="4.5"
					fill={series.orange}
					stroke="var(--color-uv-deep)"
					stroke-width="2"
				/>
			</g>
			<text x={PAD_L} y={PLOT_H + PAD_T + PAD_B - 2} font-size="10" fill={ink.dim} opacity="0.55">
				arithmetic intensity (FLOP/byte) →
			</text>
		</svg>
	{/if}

	<div class="flex items-center gap-3">
		<label for="rl-ai" class="w-28 shrink-0 font-mono text-[11px] text-uv-text-dim/70">
			intensity
		</label>
		<input
			id="rl-ai"
			type="range"
			min="-0.3"
			max="3.3"
			step="0.01"
			value={Math.log10(intensity)}
			oninput={(e) => (intensity = Math.pow(10, +e.currentTarget.value))}
			class="h-1 w-full cursor-pointer appearance-none bg-uv-mute accent-violet-400"
		/>
	</div>

	<p class="min-h-[3rem] font-mono text-[11px] leading-relaxed text-uv-text-dim/70">
		At <span class="unit text-uv-text-main">{intensity.toFixed(1)} FLOP/byte</span> the binding
		ceiling is <span class="unit text-uv-text-main">{ceiling.toFixed(1)} TFLOP/s</span> — this
		kernel is <span class="text-uv-text-main">{bound}-bound</span>.
	</p>
</div>

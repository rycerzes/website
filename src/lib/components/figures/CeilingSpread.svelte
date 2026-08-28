<script lang="ts">
	import { series, text as ink, border } from '$lib/palette';

	type Row = {
		op: string;
		best: number;
		worst: number;
		bestBy: string;
		worstBy: string;
		note: string;
	};

	// One sweep, one GPU. Same op, same reference, same gates — so the gap in a row is
	// the kernel and nothing else.
	const rows: Row[] = [
		{
			op: 'attention_decode',
			best: 92.9,
			worst: 19.6,
			bestBy: 'triton',
			worstBy: 'torch',
			note: 'the only attention shape on the memory side'
		},
		{
			op: 'matmul',
			best: 91.5,
			worst: 57.8,
			bestBy: 'triton/tf32',
			worstBy: 'triton/fp32',
			note: 'tf32 tensor cores vs pinned ieee'
		},
		{
			op: 'swiglu',
			best: 91.2,
			worst: 39.0,
			bestBy: 'tilelang',
			worstBy: 'torch',
			note: 'fusion — 72% of that category fails upstream'
		},
		{
			op: 'rmsnorm',
			best: 90.4,
			worst: 26.1,
			bestBy: 'tilelang',
			worstBy: 'torch',
			note: 'one reduction, five toolchains'
		},
		{
			op: 'rope',
			best: 89.7,
			worst: 28.9,
			bestBy: 'triton',
			worstBy: 'torch',
			note: 'element i needs element i + d/2'
		},
		{
			op: 'quantize',
			best: 88.7,
			worst: 14.0,
			bestBy: 'triton',
			worstBy: 'torch',
			note: 'quantization — 0 of 30 solved upstream'
		},
		{
			op: 'attention',
			best: 88.5,
			worst: 29.3,
			bestBy: 'triton/fp16',
			worstBy: 'torch',
			note: 'flashattention forward, online softmax'
		},
		{
			op: 'cross_entropy',
			best: 88.0,
			worst: 44.8,
			bestBy: 'triton',
			worstBy: 'torch',
			note: 'loss; output smaller than input'
		},
		{
			op: 'attention_gqa',
			best: 82.7,
			worst: 28.6,
			bestBy: 'triton/bf16',
			worstBy: 'torch',
			note: 'index the shared KV head, do not expand it'
		},
		{
			op: 'gather',
			best: 78.0,
			worst: 38.2,
			bestBy: 'triton',
			worstBy: 'torch',
			note: 'index; irregular, cannot reach peak'
		},
		{
			op: 'attention_backward',
			best: 70.3,
			worst: 11.1,
			bestBy: 'triton/bf16',
			worstBy: 'triton/fp32',
			note: 'dQ, dK, dV; three kernels'
		},
		{
			op: 'attention_causal',
			best: 67.3,
			worst: 21.1,
			bestBy: 'triton/bf16',
			worstBy: 'torch',
			note: 'skip tiles, mask only the diagonal'
		},
		{
			op: 'attention_paged',
			best: 44.8,
			worst: 13.4,
			bestBy: 'triton',
			worstBy: 'torch',
			note: 'block-table indirection'
		},
		{
			op: 'moe_gemm',
			best: 32.6,
			worst: 21.6,
			bestBy: 'triton',
			worstBy: 'torch',
			note: 'grouping, not arithmetic'
		}
	];

	const ROW_H = 24;
	const PAD_L = 132;
	const PAD_R = 46;
	const TOP = 14;

	let width = $state(0);
	let hovered = $state<number | null>(null);

	const plotW = $derived(Math.max(0, width - PAD_L - PAD_R));
	const svgH = TOP + rows.length * ROW_H + 26;
	const x = $derived((v: number) => (v / 100) * plotW);
	const activeRow = $derived(hovered === null ? null : rows[hovered]);
</script>

<div class="flex flex-col gap-2 p-4" bind:clientWidth={width}>
	<!-- legend: two series, so identity is never carried by colour alone -->
	<div class="flex items-center gap-4 font-mono text-[11px] text-uv-text-dim/70">
		<span class="flex items-center gap-1.5">
			<svg width="10" height="10" aria-hidden="true"
				><circle cx="5" cy="5" r="4.5" fill={series.blue} /></svg
			> best admitted
		</span>
		<span class="flex items-center gap-1.5">
			<svg width="10" height="10" aria-hidden="true"
				><circle cx="5" cy="5" r="4.5" fill={series.orange} /></svg
			> worst admitted
		</span>
	</div>

	{#if width > 0}
		<svg
			width="100%"
			height={svgH}
			viewBox="0 0 {width} {svgH}"
			role="img"
			aria-label="Best and worst admitted result for each of 14 operations, as a percentage of that operation's binding hardware ceiling. Best ranges from 92.9% for attention_decode down to 32.6% for moe_gemm; the worst result for the same operation is often 20 to 70 points lower."
		>
			{#each [0, 25, 50, 75, 100] as t (t)}
				<line
					x1={PAD_L + x(t)}
					y1={TOP - 8}
					x2={PAD_L + x(t)}
					y2={TOP + rows.length * ROW_H}
					stroke={border.subtle}
					stroke-width="1"
				/>
				<text
					x={PAD_L + x(t)}
					y={TOP + rows.length * ROW_H + 16}
					font-size="10"
					text-anchor="middle"
					fill={ink.dim}
					opacity="0.55">{t}%</text
				>
			{/each}

			{#each rows as r, i (r.op)}
				{@const y = TOP + i * ROW_H + ROW_H / 2}
				<!-- generous hit target, larger than the marks themselves -->
				<rect
					x="0"
					y={TOP + i * ROW_H}
					{width}
					height={ROW_H}
					fill={hovered === i ? 'var(--color-uv-raised)' : 'transparent'}
					role="presentation"
					onmouseenter={() => (hovered = i)}
					onmouseleave={() => (hovered = null)}
				/>
				<text x={PAD_L - 10} y={y + 3.5} font-size="11" text-anchor="end" fill={ink.dim}>
					{r.op}
				</text>
				<line
					x1={PAD_L + x(r.worst)}
					y1={y}
					x2={PAD_L + x(r.best)}
					y2={y}
					stroke={border.strong}
					stroke-width="2"
				/>
				<!-- 2px surface ring so overlapping marks stay separable -->
				<circle
					cx={PAD_L + x(r.worst)}
					cy={y}
					r="4.5"
					fill={series.orange}
					stroke="var(--color-uv-deep)"
					stroke-width="2"
				/>
				<circle
					cx={PAD_L + x(r.best)}
					cy={y}
					r="4.5"
					fill={series.blue}
					stroke="var(--color-uv-deep)"
					stroke-width="2"
				/>
				<text x={PAD_L + x(r.best) + 10} y={y + 3.5} font-size="10" fill={ink.primary}>
					{r.best.toFixed(1)}
				</text>
			{/each}
		</svg>
	{/if}

	<p class="min-h-[4rem] font-mono text-[11px] leading-relaxed text-uv-text-dim/70">
		{#if activeRow}
			<span class="text-uv-text-main">{activeRow.op}</span> — {activeRow.best}% via
			{activeRow.bestBy}, {activeRow.worst}% via {activeRow.worstBy}. {activeRow.note}.
		{:else}
			Hover a row for the toolchain behind each end. Three rows are low because of the operation
			rather than the code: gather is irregular by construction, moe_gemm reads every expert's
			weights, attention_paged chases a block table.
		{/if}
	</p>
</div>

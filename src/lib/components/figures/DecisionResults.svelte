<script lang="ts">
	import { border, categorical, text as ink } from '$lib/palette';
	import { linear, pct, results } from '$lib/figures/decisionModel';

	const [BASE, TRAINED] = categorical;

	const ROW = 26;
	const HEAD = 24;
	const GROUP_GAP = 16;
	const AXIS = 22;
	// The right pad leaves room for the gain label after a dot near 100%
	const PAD = { l: 58, r: 44, t: 4 };
	const groupH = (n: number) => HEAD + n * ROW;
	const H =
		PAD.t +
		results.reduce((sum, b) => sum + groupH(b.rows.length), 0) +
		GROUP_GAP * (results.length - 1) +
		AXIS;
	const TICKS = [0.4, 0.6, 0.8, 1];

	let width = $state(0);

	const innerW = $derived(Math.max(0, width - 32));
	const x = $derived(linear(0.4, 1, PAD.l, Math.max(PAD.l + 1, innerW - PAD.r)));
	const groupTop = (g: number) =>
		PAD.t + results.slice(0, g).reduce((sum, b) => sum + groupH(b.rows.length) + GROUP_GAP, 0);

	const label = results
		.map(
			(b) =>
				`${b.name}: ` +
				b.rows.map((r) => `${r.label} ${pct(r.base, 1)} to ${pct(r.trained, 1)}`).join(', ')
		)
		.join('; ');
</script>

<div class="flex flex-col gap-3 p-4" bind:clientWidth={width}>
	<div class="flex flex-wrap gap-4 font-mono text-[11px] text-uv-text-dim">
		<span class="flex items-center gap-1.5">
			<span class="inline-block size-3 border border-uv-border" style="background: {BASE}"></span>
			Qwen3.5-4B
		</span>
		<span class="flex items-center gap-1.5">
			<span class="inline-block size-3 border border-uv-border" style="background: {TRAINED}"
			></span>
			after training
		</span>
	</div>

	{#if innerW > 0}
		<svg
			width="100%"
			height={H}
			viewBox="0 0 {innerW} {H}"
			role="img"
			aria-label="Accuracy by question type, before and after training. {label}."
		>
			{#each TICKS as t (t)}
				{#each results as b, g (b.name)}
					<line
						x1={x(t)}
						x2={x(t)}
						y1={groupTop(g) + HEAD}
						y2={groupTop(g) + groupH(b.rows.length)}
						stroke={border.subtle}
					/>
				{/each}
				<text x={x(t)} y={H - 6} font-size="10" text-anchor="middle" fill={ink.dim}>{pct(t)}</text>
			{/each}

			{#each results as b, g (b.name)}
				{@const y0 = groupTop(g)}
				<text x={0} y={y0 + 15} font-size="12" fill={ink.primary}>{b.name}</text>
				<text x={innerW} y={y0 + 15} font-size="10" text-anchor="end" fill={ink.dim}>{b.note}</text>
				{#each b.rows as r, i (r.label)}
					{@const cy = y0 + HEAD + i * ROW + ROW / 2}
					{@const up = r.trained >= r.base}
					<text x={0} y={cy + 3.5} font-size="11" fill={i === 0 ? ink.primary : ink.dim}
						>{r.label}</text
					>
					<line
						x1={x(r.base)}
						x2={x(r.trained)}
						y1={cy}
						y2={cy}
						stroke={border.strong}
						stroke-width="2"
					/>
					<rect x={x(r.base) - 4} y={cy - 4} width="8" height="8" fill={BASE} />
					<circle cx={x(r.trained)} {cy} r="4.5" fill={TRAINED} />
					<text
						x={up ? x(r.trained) + 9 : x(r.trained) - 9}
						y={cy + 3.5}
						font-size="10"
						text-anchor={up ? 'start' : 'end'}
						fill={ink.dim}>+{((r.trained - r.base) * 100).toFixed(1)}</text
					>
				{/each}
			{/each}
		</svg>
	{/if}
</div>

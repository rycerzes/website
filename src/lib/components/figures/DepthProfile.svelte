<script lang="ts">
	import { Tween, prefersReducedMotion } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { border, series, text as ink } from '$lib/palette';
	import { beamData, linear, pct } from '$lib/figures/insideBeam';

	type Band = {
		band: string;
		poles: number;
		testable: number;
		sig: number;
		coherent: number;
		judge_sig: number;
		judge_sig_n: number;
		judge_rand: number;
		judge_rand_n: number;
	};
	const bands = beamData<Band[]>('depth');

	const METRICS = {
		sig: {
			name: 'steers beyond controls',
			note: 'Share of testable expert poles whose steered outputs share a theme more than 95% of effect-matched random directions. 5% would be chance.',
			a: (b: Band) => b.sig,
			b: null as ((b: Band) => number) | null,
			max: 0.25,
			ref: 0.05
		},
		coherent: {
			name: 'beam calls it coherent',
			note: 'Share of + poles whose top tokens Beam judged to form one coherent concept. Beam saw only the tokens, never the steering results.',
			a: (b: Band) => b.coherent,
			b: null,
			max: 1,
			ref: null as number | null
		},
		judge: {
			name: 'blind judge',
			note: 'Judge picks the right steered output from three, given the expert’s top tokens. Blue: significant poles; peach: random poles. Chance is 33%. Bands with fewer than 30 items are faded.',
			a: (b: Band) => b.judge_sig,
			b: (b: Band) => b.judge_rand,
			max: 1,
			ref: 1 / 3
		}
	};
	type Key = keyof typeof METRICS;

	let metric = $state<Key>('sig');
	let width = $state(0);

	const m = $derived(METRICS[metric]);
	const target = $derived(bands.flatMap((b) => [m.a(b) / m.max, m.b ? m.b(b) / m.max : 0]));
	const heights = new Tween<number[]>(
		bands.flatMap(() => [0, 0]),
		{ duration: 450, easing: cubicOut }
	);
	$effect(() => {
		void heights.set(target, { duration: prefersReducedMotion.current ? 0 : 450 });
	});

	const H = 230;
	const PAD = { l: 40, r: 8, t: 14, b: 34 };
	const plotW = $derived(Math.max(0, width - 32 - PAD.l - PAD.r));
	const slot = $derived(plotW / bands.length);
	const y = linear(0, 1, H - PAD.b, PAD.t);

	const btn =
		'border px-2 py-1 transition-colors focus-visible:outline-2 focus-visible:outline-uv-highlight';
</script>

<div class="flex flex-col gap-3 p-4" bind:clientWidth={width}>
	<div class="flex flex-wrap gap-2 font-mono text-[11px]">
		{#each Object.keys(METRICS) as k (k)}
			<button
				type="button"
				aria-pressed={metric === k}
				onclick={() => (metric = k as Key)}
				class="{btn} {metric === k
					? 'border-uv-highlight bg-uv-raised text-uv-text-main'
					: 'border-uv-border text-uv-text-dim/70 hover:text-uv-text-main'}"
				>{METRICS[k as Key].name}</button
			>
		{/each}
	</div>

	{#if width > 0}
		<svg
			width="100%"
			height={H}
			viewBox="0 0 {width - 32} {H}"
			role="img"
			aria-label="{m.name} by layer band: {bands
				.map((b) => `${b.band} ${pct(m.a(b))}${m.b ? ` vs ${pct(m.b(b))}` : ''}`)
				.join('; ')}."
		>
			{#each m.max === 1 ? [0, 0.25, 0.5, 0.75, 1] : [0, 0.2, 0.4, 0.6, 0.8, 1] as t (t)}
				<line x1={PAD.l} x2={PAD.l + plotW} y1={y(t)} y2={y(t)} stroke={border.subtle} />
				<text x={PAD.l - 6} y={y(t) + 3.5} font-size="10" text-anchor="end" fill={ink.dim}
					>{pct(t * m.max)}</text
				>
			{/each}
			{#if m.ref !== null}
				<line
					x1={PAD.l}
					x2={PAD.l + plotW}
					y1={y(m.ref / m.max)}
					y2={y(m.ref / m.max)}
					stroke={ink.dim}
					stroke-dasharray="3 3"
				/>
				<text x={PAD.l + 4} y={y(m.ref / m.max) - 4} font-size="10" fill={ink.dim}>chance</text>
			{/if}
			{#each bands as b, i (b.band)}
				{@const x0 = PAD.l + i * slot}
				{@const two = m.b !== null}
				{@const bw = two ? slot * 0.34 : slot * 0.6}
				{@const thin = metric === 'judge' && b.judge_sig_n < 30}
				<rect
					x={x0 + (two ? slot * 0.14 : slot * 0.2)}
					y={y(heights.current[2 * i])}
					width={bw}
					height={Math.max(0, y(0) - y(heights.current[2 * i]))}
					fill={series.blue}
					opacity={thin ? 0.3 : 1}
				/>
				{#if two}
					<rect
						x={x0 + slot * 0.52}
						y={y(heights.current[2 * i + 1])}
						width={bw}
						height={Math.max(0, y(0) - y(heights.current[2 * i + 1]))}
						fill={series.peach}
						opacity={b.judge_rand_n < 30 ? 0.3 : 1}
					/>
				{/if}
				<text
					x={x0 + slot / 2}
					y={H - PAD.b + 15}
					font-size="10"
					text-anchor="middle"
					fill={b.band === 'L24-31' || b.band === 'L32-39' ? ink.primary : ink.dim}
					>{b.band.replace('-', '–')}</text
				>
				<text
					x={x0 + slot / 2}
					y={y(heights.current[2 * i]) - 4}
					font-size="9"
					text-anchor="middle"
					fill={ink.dim}>{two ? '' : pct(m.a(b))}</text
				>
			{/each}
		</svg>
	{/if}

	<p class="min-h-[3rem] font-mono text-[11px] leading-relaxed text-uv-text-dim/70">{m.note}</p>
</div>

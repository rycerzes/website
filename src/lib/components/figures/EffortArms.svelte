<script lang="ts">
	import { accent, border, series, text as ink } from '$lib/palette';
	import { beamData, linear, logScale } from '$lib/figures/insideBeam';

	type Arm = {
		arm: string;
		acc: number;
		think_median: number;
		think_ratio: number;
		cap_hits: number;
		won: number;
		lost: number;
	};
	const effort = beamData<{ arms: Arm[] }>('effort');
	const by = Object.fromEntries(effort.arms.map((a) => [a.arm, a]));

	const ABOUT: Record<string, { name: string; kind: 'dial' | 'lever' | 'control'; text: string }> =
		{
			dial8: { name: 'effort 8', kind: 'dial', text: 'The starting point for every arm.' },
			dial32: {
				name: 'effort 32',
				kind: 'dial',
				text: 'Raising the dial: accuracy saturates here.'
			},
			dial128: { name: 'effort 128', kind: 'dial', text: 'More thinking, no more accuracy.' },
			dial512: {
				name: 'effort 512',
				kind: 'dial',
				text: '2.55× the thinking of effort 8 for the same accuracy as 32; 8 runs hit the 12k-token cap.'
			},
			swap: {
				name: 'digit swap',
				kind: 'lever',
				text: "At effort 8, add (mean residual at N's digit for 512 − for 8) at layer 12, on that one position."
			},
			swap_ctrl: {
				name: 'random vector',
				kind: 'control',
				text: 'Same position, same norm as the swap, random direction. Thinking unchanged.'
			},
			route_up_prompt: {
				name: '37 effort experts',
				kind: 'lever',
				text: 'Route the 37 experts whose selection tracks effort as they are at 512, on prompt tokens only.'
			},
			route_ctrl_prompt: {
				name: '37 random experts',
				kind: 'control',
				text: 'Same layers and deltas, random experts. Lifts accuracy just as much.'
			},
			dir_spread: {
				name: 'effort direction',
				kind: 'lever',
				text: 'The log₂(effort) readout direction, pushed gently across layers 15–30.'
			}
		};
	const PAIRS: [string, string][] = [
		['swap', 'swap_ctrl'],
		['route_up_prompt', 'route_ctrl_prompt']
	];
	const DIAL = ['dial8', 'dial32', 'dial128', 'dial512'];

	let width = $state(0);
	let sel = $state('swap');

	const H = 280;
	const PAD = { l: 40, r: 16, t: 16, b: 34 };
	const plotW = $derived(Math.max(0, width - 32 - PAD.l - PAD.r));
	const x = $derived(logScale(0.9, 2.8, PAD.l, PAD.l + plotW));
	const y = linear(0.78, 0.96, H - PAD.b, PAD.t);
	const colour = (k: string) =>
		ABOUT[k].kind === 'dial' ? series.blue : ABOUT[k].kind === 'lever' ? accent : series.peach;
	const a = $derived(by[sel]);
</script>

<div class="flex flex-col gap-3 p-4 font-mono text-[11px]" bind:clientWidth={width}>
	<div class="flex flex-wrap gap-1.5" role="group" aria-label="arm">
		{#each Object.keys(ABOUT) as k (k)}
			<button
				type="button"
				aria-pressed={sel === k}
				onclick={() => (sel = k)}
				class="flex items-center gap-1.5 border px-2 py-1 transition-colors focus-visible:outline-2 focus-visible:outline-uv-highlight {sel ===
				k
					? 'border-uv-highlight bg-uv-raised text-uv-text-main'
					: 'border-uv-border text-uv-text-dim/70 hover:text-uv-text-main'}"
			>
				<span class="inline-block h-2.5 w-2.5 rounded-[2px]" style="background: {colour(k)}"
				></span>{ABOUT[k].name}
			</button>
		{/each}
	</div>

	{#if width > 0}
		<svg
			width="100%"
			height={H}
			viewBox="0 0 {width - 32} {H}"
			role="img"
			aria-label="Accuracy against median thinking length relative to effort 8, on 100 AIME 2024, AIME 2025 and AMC 2023 problems. {effort.arms
				.map(
					(r) => `${ABOUT[r.arm].name}: ${Math.round(r.acc * 100)}%, ${r.think_ratio.toFixed(2)}×`
				)
				.join('; ')}."
		>
			{#each [0.8, 0.85, 0.9, 0.95] as t (t)}
				<line x1={PAD.l} x2={PAD.l + plotW} y1={y(t)} y2={y(t)} stroke={border.subtle} />
				<text x={PAD.l - 6} y={y(t) + 3.5} font-size="10" text-anchor="end" fill={ink.dim}
					>{Math.round(t * 100)}%</text
				>
			{/each}
			{#each [1, 1.5, 2, 2.5] as t (t)}
				<text x={x(t)} y={H - PAD.b + 15} font-size="10" text-anchor="middle" fill={ink.dim}
					>{t}×</text
				>
			{/each}
			<text x={PAD.l + plotW} y={H - 4} font-size="10" text-anchor="end" fill={ink.dim}
				>median thinking vs effort 8</text
			>
			<path
				d={DIAL.map((k, i) => `${i ? 'L' : 'M'}${x(by[k].think_ratio)},${y(by[k].acc)}`).join('')}
				fill="none"
				stroke={series.blue}
				stroke-opacity="0.5"
			/>
			{#each PAIRS as [lever, ctrl] (lever)}
				<line
					x1={x(by[lever].think_ratio)}
					y1={y(by[lever].acc)}
					x2={x(by[ctrl].think_ratio)}
					y2={y(by[ctrl].acc)}
					stroke={border.strong}
					stroke-dasharray="3 3"
				/>
			{/each}
			{#each DIAL as k (k)}
				<text
					x={x(by[k].think_ratio)}
					y={y(by[k].acc) + 18}
					font-size="10"
					text-anchor="middle"
					fill={series.blue}>{k.slice(4)}</text
				>
			{/each}
			{#each effort.arms as r (r.arm)}
				<circle
					cx={x(r.think_ratio)}
					cy={y(r.acc)}
					r={sel === r.arm ? 7 : 5}
					fill={colour(r.arm)}
					stroke={sel === r.arm ? ink.primary : 'var(--color-uv-deep)'}
					stroke-width="2"
				/>
			{/each}
		</svg>
	{/if}

	<p class="min-h-[3.5rem] leading-relaxed text-uv-text-dim/70">
		<span class="text-uv-text-main">{ABOUT[sel].name}</span>: {Math.round(a.acc * 100)}% correct,
		median thinking {a.think_median} tokens ({a.think_ratio.toFixed(2)}× effort 8){#if sel !== 'dial8'},
			{a.won} problems gained and {a.lost} lost against effort 8{/if}. {ABOUT[sel].text}
	</p>
</div>

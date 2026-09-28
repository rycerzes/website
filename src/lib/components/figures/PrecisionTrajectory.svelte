<script lang="ts">
	import { series, text as ink, border } from '$lib/palette';

	type Kind = 'plumbing' | 'ranker';
	type Step = { label: string; value: number; kind: Kind | null; note: string };

	// DEP-5 precision over the rebuild. The corpus grew from 392 to 671 queries along the way.
	const steps: Step[] = [
		{
			label: 'first measurement',
			value: 0.652,
			kind: null,
			note: 'the cascade as first built, against Debian maintainer labels'
		},
		{
			label: 'GPL rename bridged',
			value: 0.795,
			kind: 'plumbing',
			note: 'SPDX 3.0 renamed the GPL ids; ~3,700 rules had been silently dropped'
		},
		{
			label: 'corroboration',
			value: 0.853,
			kind: 'plumbing',
			note: 'score a license across all of its rules, not just the best one'
		},
		{
			label: 'learned reject',
			value: 0.873,
			kind: 'ranker',
			note: 'the ranker learns when to abstain, replacing a hand-set confidence bar'
		},
		{
			label: 'compounds + list gate',
			value: 0.862,
			kind: 'plumbing',
			note: 'harder labels: compound expressions scored as sets; gate fixed for ImageMagick'
		},
		{
			label: 'tree re-swept',
			value: 0.879,
			kind: 'ranker',
			note: 'depth 6 at lr 0.03 — the old depth limit was a learning-rate artifact'
		},
		{
			label: 'shingle 3, cap 200',
			value: 0.885,
			kind: 'plumbing',
			note: 'matcher constants swept against the variable that actually bound them'
		}
	];

	const SCANCODE = 0.8404;
	const colour: Record<Kind, string> = { plumbing: series.blue, ranker: series.orange };

	const Y_MIN = 0.62,
		Y_MAX = 0.92;
	const PAD_L = 40,
		PAD_R = 16,
		PAD_T = 14,
		PAD_B = 22;
	const PLOT_H = 200;

	let width = $state(0);
	let active = $state(steps.length - 1);

	const plotW = $derived(Math.max(0, width - PAD_L - PAD_R));
	const px = $derived((i: number) => (i / (steps.length - 1)) * plotW);
	const py = (v: number) => PLOT_H - ((v - Y_MIN) / (Y_MAX - Y_MIN)) * PLOT_H;

	const current = $derived(steps[active]);
	const delta = $derived(active === 0 ? 0 : current.value - steps[active - 1].value);
	const rankerShare = steps.reduce(
		(acc, s, i) => (s.kind === 'ranker' ? acc + (s.value - steps[i - 1].value) : acc),
		0
	);
</script>

<div class="flex flex-col gap-3 p-4" bind:clientWidth={width}>
	<div class="flex flex-wrap items-center gap-4 font-mono text-[11px] text-uv-text-dim/70">
		<span class="flex items-center gap-1.5">
			<svg width="10" height="10" aria-hidden="true"
				><circle cx="5" cy="5" r="4.5" fill={series.blue} /></svg
			> defect / index fix
		</span>
		<span class="flex items-center gap-1.5">
			<svg width="10" height="10" aria-hidden="true"
				><circle cx="5" cy="5" r="4.5" fill={series.orange} /></svg
			> learned ranker
		</span>
		<span class="flex items-center gap-1.5">
			<svg width="14" height="10" aria-hidden="true"
				><line x1="0" y1="5" x2="14" y2="5" stroke={ink.dim} stroke-dasharray="3 2" /></svg
			> ScanCode 0.840
		</span>
	</div>

	{#if width > 0}
		<svg
			width="100%"
			height={PLOT_H + PAD_T + PAD_B}
			viewBox="0 0 {width} {PLOT_H + PAD_T + PAD_B}"
			role="img"
			aria-label="DEP-5 precision over the rebuild, from 0.652 to 0.885 across seven steps. Steps attributed to the learned ranker add about {rankerShare.toFixed(
				3
			)} in total; the rest came from defect and index fixes. Selected: {current.label}, {current.value.toFixed(
				3
			)}."
		>
			<g transform="translate({PAD_L}, {PAD_T})">
				{#each [0.65, 0.7, 0.75, 0.8, 0.85, 0.9] as t (t)}
					<line x1="0" y1={py(t)} x2={plotW} y2={py(t)} stroke={border.subtle} stroke-width="1" />
					<text
						x="-8"
						y={py(t) + 3.5}
						font-size="10"
						text-anchor="end"
						fill={ink.dim}
						opacity="0.55">{t.toFixed(2)}</text
					>
				{/each}

				<line
					x1="0"
					y1={py(SCANCODE)}
					x2={plotW}
					y2={py(SCANCODE)}
					stroke={ink.dim}
					stroke-width="1"
					stroke-dasharray="4 3"
					opacity="0.7"
				/>

				{#each steps as s, i (s.label)}
					{#if i > 0}
						{@const prev = steps[i - 1]}
						<line
							x1={px(i - 1)}
							y1={py(prev.value)}
							x2={px(i)}
							y2={py(s.value)}
							stroke={s.kind ? colour[s.kind] : ink.dim}
							stroke-width={i === active ? 3 : 2}
						/>
					{/if}
				{/each}

				{#each steps as s, i (s.label)}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<circle
						cx={px(i)}
						cy={py(s.value)}
						r={i === active ? 6 : 4}
						fill={s.kind ? colour[s.kind] : ink.dim}
						stroke="var(--color-uv-deep)"
						stroke-width="2"
						onmouseenter={() => (active = i)}
						style="cursor: pointer"
					/>
				{/each}

				<text
					x={Math.min(Math.max(px(active), 24), plotW - 24)}
					y={py(current.value) - 12}
					font-size="11"
					text-anchor="middle"
					fill={ink.primary}>{current.value.toFixed(3)}</text
				>
			</g>
		</svg>
	{/if}

	<div class="flex items-center gap-3">
		<label for="pt-step" class="w-16 shrink-0 font-mono text-[11px] text-uv-text-dim/70">
			step
		</label>
		<input
			id="pt-step"
			type="range"
			min="0"
			max={steps.length - 1}
			step="1"
			bind:value={active}
			class="h-1 w-full cursor-pointer appearance-none bg-uv-mute accent-violet-400"
		/>
	</div>

	<p class="min-h-[3rem] font-mono text-[11px] leading-relaxed text-uv-text-dim/70">
		<span class="text-uv-text-main">{current.label}</span>
		{#if active > 0}
			<span class="unit">({delta >= 0 ? '+' : ''}{delta.toFixed(3)})</span>
		{/if}
		— {current.note}.
	</p>
</div>

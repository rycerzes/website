<script lang="ts">
	import { Tween, prefersReducedMotion } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { accent, border, series, text as ink } from '$lib/palette';
	import { beamData, linear } from '$lib/figures/insideBeam';

	type Subject = { diff: number; p: number; ban: number; ctrl: number; n: number };
	type Arm = {
		n_experts: number;
		per_layer: Record<string, number>;
		subjects: Record<string, Subject>;
	};
	const bans = beamData<Record<string, Arm>>('bans');
	const ARMS = ['law', 'health', 'math'] as const;
	type ArmKey = (typeof ARMS)[number];
	const SUBJECTS = Object.keys(bans.law.subjects);

	let arm = $state<ArmKey>('law');
	let width = $state(0);
	let focus = $state<string | null>(null);

	const rows = $derived(
		SUBJECTS.map((s) => ({ s, ...bans[arm].subjects[s] })).sort((a, b) => a.diff - b.diff)
	);
	const order = $derived(rows.map((r) => r.s));
	const diffs = new Tween<number[]>(
		SUBJECTS.map(() => 0),
		{ duration: 450, easing: cubicOut }
	);
	$effect(() => {
		const next = SUBJECTS.map((s) => bans[arm].subjects[s].diff);
		void diffs.set(next, { duration: prefersReducedMotion.current ? 0 : 450 });
	});

	const ROW = 20;
	const LABEL = 118;
	const H = SUBJECTS.length * ROW + 30;
	const plotW = $derived(Math.max(0, width - 32 - LABEL - 40));
	const x = $derived(linear(-16, 4, LABEL, LABEL + plotW));
	const active = $derived(focus ? bans[arm].subjects[focus] : null);
	const layers = $derived(
		Array.from({ length: 49 }, (_, i) => bans[arm].per_layer[String(i + 3)] ?? 0)
	);
	const maxLayer = $derived(Math.max(...layers, 1));

	const btn =
		'border px-2 py-1 transition-colors focus-visible:outline-2 focus-visible:outline-uv-highlight';
	const p = (v: number) => (v < 1e-3 ? v.toExponential(0) : v.toFixed(2));
</script>

<div class="flex flex-col gap-3 p-4 font-mono text-[11px]" bind:clientWidth={width}>
	<div class="flex flex-wrap items-center gap-2">
		<span class="text-uv-text-dim/70">ban the experts beam labelled</span>
		{#each ARMS as a (a)}
			<button
				type="button"
				aria-pressed={arm === a}
				onclick={() => (arm = a)}
				class="{btn} {arm === a
					? 'border-uv-highlight bg-uv-raised text-uv-text-main'
					: 'border-uv-border text-uv-text-dim/70 hover:text-uv-text-main'}"
				>{a} ({bans[a].n_experts})</button
			>
		{/each}
	</div>

	{#if width > 0}
		<svg
			width="100%"
			height={H}
			viewBox="0 0 {width - 32} {H}"
			role="img"
			aria-label="MMLU-Pro accuracy change per subject when the {arm} experts are banned, against a ban of the same number of load-matched random experts: {rows
				.map((r) => `${r.s} ${r.diff > 0 ? '+' : ''}${r.diff}`)
				.join(', ')} points."
		>
			{#each [-15, -10, -5, 0] as t (t)}
				<line
					x1={x(t)}
					x2={x(t)}
					y1={4}
					y2={H - 22}
					stroke={t === 0 ? border.strong : border.subtle}
				/>
				<text x={x(t)} y={H - 8} font-size="10" text-anchor="middle" fill={ink.dim}>{t}</text>
			{/each}
			{#each SUBJECTS as s, i (s)}
				{@const rank = order.indexOf(s)}
				{@const yy = 6 + rank * ROW}
				{@const d = diffs.current[i]}
				{@const own = s === arm}
				{@const sig = bans[arm].subjects[s].p < 0.001}
				<g class="row" style="transform: translateY({yy}px)">
					<!-- svelte-ignore a11y_mouse_events_have_key_events -->
					<rect
						x="0"
						y="-2"
						width={width - 32}
						height={ROW}
						fill={focus === s ? 'var(--color-uv-raised)' : 'transparent'}
						role="presentation"
						onmouseover={() => (focus = s)}
						onmouseleave={() => (focus = null)}
					/>
					<text
						x={LABEL - 8}
						y={ROW / 2 + 1}
						font-size="11"
						text-anchor="end"
						fill={own ? accent : ink.dim}>{s}</text
					>
					<rect
						x={Math.min(x(0), x(d))}
						y={3}
						width={Math.abs(x(d) - x(0))}
						height={ROW - 9}
						fill={own ? accent : sig ? series.blue : border.strong}
					/>
					<text
						x={x(Math.min(d, 0)) - 4}
						y={ROW / 2 + 1}
						font-size="10"
						text-anchor="end"
						fill={own || sig ? ink.primary : ink.dim}>{d < -0.5 ? d.toFixed(1) : ''}</text
					>
				</g>
			{/each}
		</svg>
	{/if}

	<p class="min-h-[2.5rem] leading-relaxed text-uv-text-dim/70">
		{#if focus && active}
			<span class="text-uv-text-main">{focus}</span>: {active.ban}% with the ban vs {active.ctrl}%
			with the matched control ({active.n} questions, McNemar p = {p(active.p)}).
		{:else}
			Bars are the ban minus a ban of the same number of random experts with matched routing load.
			Own subject in mauve; other subjects with p &lt; 0.001 in blue. Hover a row for the numbers.
		{/if}
	</p>

	<div class="flex flex-col gap-1">
		<span class="text-uv-text-dim/60"
			>where the {bans[arm].n_experts} banned experts sit, layer 3 → 51</span
		>
		<svg
			width="100%"
			height="34"
			viewBox="0 0 {Math.max(1, width - 32)} 34"
			role="img"
			aria-label="Banned {arm} experts per layer: {layers.join(', ')}."
		>
			{#each layers as c, i (i)}
				{@const bw = (width - 32) / 49}
				<rect
					x={i * bw + 0.5}
					y={32 - (c / maxLayer) * 30}
					width={bw - 1}
					height={(c / maxLayer) * 30}
					fill={accent}
					opacity="0.75"
				/>
			{/each}
		</svg>
	</div>
</div>

<style>
	.row {
		transition: transform 450ms ease-out;
	}

	@media (prefers-reduced-motion: reduce) {
		.row {
			transition: none;
		}
	}
</style>

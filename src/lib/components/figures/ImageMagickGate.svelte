<script lang="ts">
	import { series, semantic, text as ink, border } from '$lib/palette';

	// Matcher evidence for one real Apache-2.0 LICENSE file (11,350 chars), top candidates.
	type Cand = { name: string; family: string; run: number; cov: number };
	const cands: Cand[] = [
		{ name: 'ImageMagick', family: 'OTHER', run: 847, cov: 0.8065 },
		{ name: 'Apache-2.0', family: 'APACHE', run: 764, cov: 0.9963 },
		{ name: 'Pixar', family: 'OTHER', run: 752, cov: 0.9838 },
		{ name: 'ECL-2.0', family: 'ECL', run: 744, cov: 0.9138 },
		{ name: 'SHL-0.5', family: 'OTHER', run: 626, cov: 0.8756 }
	];

	type Mode = 'leader' | 'list';
	let mode = $state<Mode>('leader');

	// Leader gate: the ranker only acts if the run-first leader is in a trained family.
	const leader = cands[0];
	const rankerActs = $derived(mode === 'list' || leader.family !== 'OTHER');
	const answer = $derived(rankerActs ? 'Apache-2.0' : leader.name);

	const ROW_H = 34;
	const PAD_L = 92;
	const PAD_R = 44;
	const RUN_MAX = 900;

	let width = $state(0);
	const half = $derived(Math.max(0, (width - PAD_L - PAD_R - 16) / 2));
	const svgH = cands.length * ROW_H + 24;
</script>

<div class="flex flex-col gap-3 p-4" bind:clientWidth={width}>
	<div
		class="flex flex-wrap items-center gap-2 font-mono text-[11px]"
		role="group"
		aria-label="gate"
	>
		<span class="text-uv-text-dim/70">ranker gate asks about</span>
		{#each [['leader', 'the leader'], ['list', 'the whole list']] as [m, label] (m)}
			<button
				type="button"
				aria-pressed={mode === m}
				onclick={() => (mode = m as Mode)}
				class="border px-2 py-1 transition-colors focus-visible:outline-2 focus-visible:outline-uv-highlight {mode ===
				m
					? 'border-uv-highlight bg-uv-raised text-uv-text-main'
					: 'border-uv-border text-uv-text-dim/70 hover:text-uv-text-main'}"
			>
				{label}
			</button>
		{/each}
	</div>

	{#if width > 0}
		<svg
			width="100%"
			height={svgH}
			viewBox="0 0 {width} {svgH}"
			role="img"
			aria-label="Candidates for a real Apache-2.0 file. ImageMagick has the longest run, 847 tokens, but covers only 0.81 of its reference; Apache-2.0 has run 764 and covers 0.996. With the gate asking about {mode ===
			'leader'
				? 'the leader, whose family is OTHER, the ranker declines and the run-first ordering answers ImageMagick'
				: 'the whole list, the ranker scores the candidates and answers Apache-2.0'}."
		>
			<!-- short headers once a column is too narrow for the long ones -->
			<text x={PAD_L} y="10" font-size="10" fill={ink.dim} opacity="0.7"
				>{half < 130 ? 'run' : 'longest run (tokens)'}</text
			>
			<text x={PAD_L + half + 16} y="10" font-size="10" fill={ink.dim} opacity="0.7"
				>{half < 130 ? 'coverage' : 'reference coverage'}</text
			>

			{#each cands as c, i (c.name)}
				{@const y = 20 + i * ROW_H}
				{@const chosen = c.name === answer}
				<text
					x={PAD_L - 8}
					y={y + 14}
					font-size="11"
					text-anchor="end"
					fill={chosen ? ink.primary : ink.dim}
					font-weight={chosen ? 700 : 400}>{c.name}</text
				>
				<rect x={PAD_L} y={y + 4} width={half} height="14" fill={border.subtle} opacity="0.35" />
				<rect
					x={PAD_L}
					y={y + 4}
					width={(c.run / RUN_MAX) * half}
					height="14"
					fill={series.blue}
					opacity={chosen ? 1 : 0.55}
				/>
				<text
					x={PAD_L + (c.run / RUN_MAX) * half - 4}
					y={y + 15}
					font-size="10"
					text-anchor="end"
					fill={ink.primary}>{c.run}</text
				>
				<rect
					x={PAD_L + half + 16}
					y={y + 4}
					width={half}
					height="14"
					fill={border.subtle}
					opacity="0.35"
				/>
				<rect
					x={PAD_L + half + 16}
					y={y + 4}
					width={c.cov * half}
					height="14"
					fill={series.orange}
					opacity={chosen ? 1 : 0.55}
				/>
				<text
					x={PAD_L + half + 16 + c.cov * half - 4}
					y={y + 15}
					font-size="10"
					text-anchor="end"
					fill={ink.primary}>{c.cov.toFixed(3)}</text
				>
				{#if chosen}
					<!-- centred on the bars (y+4 .. y+18) and ending where the coverage track ends -->
					<rect
						x="2"
						y={y - 2}
						width={PAD_L + 2 * half + 16 + 8 - 2}
						height="26"
						rx="2"
						fill="none"
						stroke={c.name === 'Apache-2.0' ? semantic.pass : semantic.fail}
						stroke-width="1.5"
					/>
				{/if}
			{/each}
		</svg>
	{/if}

	<p class="min-h-[3.75rem] font-mono text-[11px] leading-relaxed text-uv-text-dim/70">
		{#if mode === 'leader'}
			The leader is <span class="text-uv-text-main">ImageMagick</span>, family OTHER, so the ranker
			declines and run-first ordering answers
			<span class="text-uv-text-main">ImageMagick — wrong</span>. Across the pool:
			<span class="unit text-uv-text-main">286 of 639</span> Apache-2.0 files, Apache R@1
			<span class="unit text-uv-text-main">0.48</span>.
		{:else}
			A trained family is in the list, so the ranker scores every candidate. Coverage wins and it
			answers <span class="text-uv-text-main">Apache-2.0 — right</span>. Apache R@1
			<span class="unit text-uv-text-main">0.95</span>; prevalence R@1
			<span class="unit text-uv-text-main">0.9468 → 0.9752</span>.
		{/if}
	</p>
</div>

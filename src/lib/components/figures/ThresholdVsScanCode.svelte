<script lang="ts">
	import { series, semantic, text as ink, border } from '$lib/palette';

	// Nested CV, accept threshold tau derived inside each training fold; paired McNemar vs ScanCode.
	type Row = { tau: number; cov: number; prec: number; r1: number; p: number };
	type Corpus = {
		name: string;
		sc: { cov: number; prec: number; r1: number };
		rows: Row[];
	};

	const corpora: Record<'dep5' | 'spdx', Corpus> = {
		dep5: {
			name: 'DEP-5 (n=671)',
			sc: { cov: 0.99, prec: 0.8404, r1: 0.8316 },
			rows: [
				{ tau: 0.05, cov: 0.975, prec: 0.8547, r1: 0.8331, p: 1.0 },
				{ tau: 0.1, cov: 0.967, prec: 0.8582, r1: 0.8301, p: 1.0 },
				{ tau: 0.15, cov: 0.952, prec: 0.8717, r1: 0.8301, p: 1.0 },
				{ tau: 0.2, cov: 0.946, prec: 0.8772, r1: 0.8301, p: 1.0 },
				{ tau: 0.3, cov: 0.893, prec: 0.8948, r1: 0.7988, p: 0.02 },
				{ tau: 0.4, cov: 0.858, prec: 0.9132, r1: 0.7839, p: 0.001 },
				{ tau: 0.5, cov: 0.824, prec: 0.9241, r1: 0.7615, p: 0.0 }
			]
		},
		spdx: {
			name: 'SPDX-tag (n=266)',
			sc: { cov: 0.962, prec: 0.9727, r1: 0.9361 },
			rows: [
				{ tau: 0.05, cov: 0.981, prec: 0.9464, r1: 0.9286, p: 0.791 },
				{ tau: 0.1, cov: 0.977, prec: 0.9462, r1: 0.9248, p: 0.607 },
				{ tau: 0.15, cov: 0.974, prec: 0.9498, r1: 0.9248, p: 0.607 },
				{ tau: 0.2, cov: 0.966, prec: 0.9533, r1: 0.9211, p: 0.454 },
				{ tau: 0.3, cov: 0.947, prec: 0.9563, r1: 0.906, p: 0.115 },
				{ tau: 0.4, cov: 0.902, prec: 0.9667, r1: 0.8722, p: 0.002 },
				{ tau: 0.5, cov: 0.857, prec: 0.9737, r1: 0.8346, p: 0.0 }
			]
		}
	};

	let key = $state<'dep5' | 'spdx'>('dep5');
	let idx = $state(3);

	const corpus = $derived(corpora[key]);
	const row = $derived(corpus.rows[idx]);
	const behind = $derived(row.p < 0.05 && row.r1 < corpus.sc.r1);

	const X_MIN = 0.8,
		X_MAX = 1.0,
		Y_MIN = 0.82,
		Y_MAX = 0.99;
	const PAD_L = 44,
		PAD_R = 16,
		PAD_T = 12,
		PAD_B = 32;
	const PLOT_H = 190;

	let width = $state(0);
	const plotW = $derived(Math.max(0, width - PAD_L - PAD_R));
	const px = $derived((v: number) => ((v - X_MIN) / (X_MAX - X_MIN)) * plotW);
	const py = (v: number) => PLOT_H - ((v - Y_MIN) / (Y_MAX - Y_MIN)) * PLOT_H;
	const path = $derived('M ' + corpus.rows.map((r) => `${px(r.cov)},${py(r.prec)}`).join(' L '));

	const fmtP = (p: number) => (p < 0.001 ? '< 0.001' : p.toFixed(3));
</script>

<div class="flex flex-col gap-3 p-4" bind:clientWidth={width}>
	<div
		class="flex flex-wrap items-center gap-2 font-mono text-[11px]"
		role="group"
		aria-label="corpus"
	>
		{#each [['dep5', 'DEP-5'], ['spdx', 'SPDX-tag']] as [k, label] (k)}
			<button
				type="button"
				aria-pressed={key === k}
				onclick={() => (key = k as 'dep5' | 'spdx')}
				class="border px-2 py-1 transition-colors focus-visible:outline-2 focus-visible:outline-uv-highlight {key ===
				k
					? 'border-uv-highlight bg-uv-raised text-uv-text-main'
					: 'border-uv-border text-uv-text-dim/70 hover:text-uv-text-main'}"
			>
				{label}
			</button>
		{/each}
		<span class="ml-2 flex items-center gap-1.5 text-uv-text-dim/70">
			<svg width="10" height="10" aria-hidden="true"
				><circle cx="5" cy="5" r="4.5" fill={series.blue} /></svg
			> atarashi
		</span>
		<span class="flex items-center gap-1.5 text-uv-text-dim/70">
			<svg width="10" height="10" aria-hidden="true"
				><rect x="1" y="1" width="8" height="8" fill={series.orange} /></svg
			> ScanCode
		</span>
	</div>

	{#if width > 0}
		<svg
			width="100%"
			height={PLOT_H + PAD_T + PAD_B}
			viewBox="0 0 {width} {PLOT_H + PAD_T + PAD_B}"
			role="img"
			aria-label="Precision against coverage on {corpus.name} under nested cross-validation, as the accept threshold moves from 0.05 to 0.50. At tau {row.tau.toFixed(
				2
			)}, atarashi answers {(row.cov * 100).toFixed(1)}% at precision {row.prec.toFixed(
				3
			)} with R@1 {row.r1.toFixed(3)}; ScanCode has R@1 {corpus.sc.r1.toFixed(3)}; McNemar p {fmtP(
				row.p
			)}."
		>
			<g transform="translate({PAD_L}, {PAD_T})">
				{#each [0.85, 0.9, 0.95] as t (t)}
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
				{#each [0.85, 0.9, 0.95, 1.0] as t (t)}
					<line x1={px(t)} y1="0" x2={px(t)} y2={PLOT_H} stroke={border.subtle} stroke-width="1" />
					<text
						x={px(t)}
						y={PLOT_H + 14}
						font-size="10"
						text-anchor="middle"
						fill={ink.dim}
						opacity="0.55">{t.toFixed(2)}</text
					>
				{/each}

				<path d={path} fill="none" stroke={series.blue} stroke-width="2" />
				{#each corpus.rows as r, i (r.tau)}
					<circle
						cx={px(r.cov)}
						cy={py(r.prec)}
						r={i === idx ? 6 : 3}
						fill={series.blue}
						stroke="var(--color-uv-deep)"
						stroke-width="2"
					/>
				{/each}
				<rect
					x={px(corpus.sc.cov) - 5}
					y={py(corpus.sc.prec) - 5}
					width="10"
					height="10"
					fill={series.orange}
					stroke="var(--color-uv-deep)"
					stroke-width="2"
				/>
			</g>
			<text x={PAD_L} y={PLOT_H + PAD_T + PAD_B - 2} font-size="10" fill={ink.dim} opacity="0.55">
				coverage → · precision ↑
			</text>
		</svg>
	{/if}

	<div class="flex items-center gap-3">
		<label for="tv-tau" class="w-24 shrink-0 font-mono text-[11px] text-uv-text-dim/70">
			threshold τ
		</label>
		<input
			id="tv-tau"
			type="range"
			min="0"
			max={corpus.rows.length - 1}
			step="1"
			bind:value={idx}
			class="h-1 w-full cursor-pointer appearance-none bg-uv-mute accent-violet-400"
		/>
		<span class="unit w-10 shrink-0 font-mono text-[11px] text-uv-text-main"
			>{row.tau.toFixed(2)}</span
		>
	</div>

	<p class="min-h-[3rem] font-mono text-[11px] leading-relaxed text-uv-text-dim/70">
		R@1 <span class="unit text-uv-text-main">{row.r1.toFixed(3)}</span> vs ScanCode
		<span class="unit text-uv-text-main">{corpus.sc.r1.toFixed(3)}</span>, McNemar
		<span class="unit text-uv-text-main">p {fmtP(row.p)}</span> —
		<span style="color: {behind ? semantic.fail : semantic.pass}">■</span>
		<span class="text-uv-text-main">{behind ? 'significantly behind' : 'level'}</span>. Raising τ
		buys precision by giving up answers.
	</p>
</div>

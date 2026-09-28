<script lang="ts">
	import { onMount } from 'svelte';
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { series, semantic, surface, text as ink, border, accent } from '$lib/palette';

	type Group = 'input' | 'nirjas' | 'atarashi' | 'output';
	type StageId = 'file' | 'extract' | 'gate' | 'spdx' | 'hash' | 'match' | 'rank' | 'out';
	type Outcome = 'license' | 'unknown' | 'dropped';

	const stages: { id: StageId; group: Group; label: string; sub: string }[] = [
		{ id: 'file', group: 'input', label: 'source file', sub: 'any file in the tree' },
		{ id: 'extract', group: 'nirjas', label: 'extract', sub: 'tree-sitter comments' },
		{ id: 'gate', group: 'nirjas', label: 'gate', sub: 'model2vec · τ 0.20' },
		{ id: 'spdx', group: 'atarashi', label: 'SPDX tag', sub: 'AND / OR / WITH' },
		{ id: 'hash', group: 'atarashi', label: 'exact hash', sub: 'verbatim text' },
		{ id: 'match', group: 'atarashi', label: 'matcher', sub: 'seed-and-extend' },
		{ id: 'rank', group: 'atarashi', label: 'ranker', sub: 'GBM · accept / abstain' },
		{ id: 'out', group: 'output', label: 'report', sub: 'license + span' }
	];

	type Example = {
		name: string;
		snippet: string;
		steps: { stage: StageId; note: string }[];
		result: string;
		outcome: Outcome;
	};

	const examples: Example[] = [
		{
			name: 'main.go',
			snippet: '// SPDX-License-Identifier: Apache-2.0 WITH LLVM-exception',
			steps: [
				{ stage: 'file', note: 'a Go source file' },
				{ stage: 'extract', note: 'Tree-sitter pulls out one comment block' },
				{ stage: 'gate', note: 'license-related, so it is passed on' },
				{ stage: 'spdx', note: 'a tag is found; the expression is kept whole' },
				{ stage: 'out', note: 'done in the first stage' }
			],
			result: 'Apache-2.0 WITH LLVM-exception',
			outcome: 'license'
		},
		{
			name: 'LICENSE',
			snippet: 'Apache License\nVersion 2.0, January 2004\n…\nEND OF TERMS AND CONDITIONS',
			steps: [
				{ stage: 'file', note: 'a plain LICENSE file' },
				{ stage: 'extract', note: 'prose, so it passes through whole' },
				{ stage: 'gate', note: 'license text, so it is passed on' },
				{ stage: 'spdx', note: 'no tag' },
				{ stage: 'hash', note: 'no exact match: the appendix is missing' },
				{ stage: 'match', note: 'longest run: ImageMagick 847, Apache-2.0 764' },
				{ stage: 'rank', note: 'coverage decides: Apache-2.0 0.996 vs 0.807' },
				{ stage: 'out', note: 'the span that proves it comes from the matcher' }
			],
			result: 'Apache-2.0 + character span',
			outcome: 'license'
		},
		{
			name: 'parser.py',
			snippet: '# TODO: handle nested quotes in the lexer',
			steps: [
				{ stage: 'file', note: 'a Python source file' },
				{ stage: 'extract', note: 'one comment block' },
				{ stage: 'gate', note: 'not license text, so it is dropped' },
				{ stage: 'out', note: 'Atarashi is never called' }
			],
			result: 'nothing to identify',
			outcome: 'dropped'
		},
		{
			name: 'eval_terms.txt',
			snippet: 'Evaluation License. Internal evaluation only…\nPROVIDED "AS IS", WITHOUT WARRANTY…',
			steps: [
				{ stage: 'file', note: 'a bespoke proprietary license' },
				{ stage: 'extract', note: 'prose, so it passes through whole' },
				{ stage: 'gate', note: 'license text, so it is passed on' },
				{ stage: 'spdx', note: 'no tag' },
				{ stage: 'hash', note: 'no exact match' },
				{ stage: 'match', note: 'only warranty-disclaimer boilerplate overlaps' },
				{ stage: 'rank', note: 'below the accept threshold, so it abstains' },
				{ stage: 'out', note: 'correct here; on about half of such files it still guesses' }
			],
			result: 'UNKNOWN + rejected candidates',
			outcome: 'unknown'
		}
	];

	const groupColour: Record<Group, string> = {
		input: ink.dim,
		nirjas: series.blue,
		atarashi: series.orange,
		output: ink.dim
	};
	const outcomeColour: Record<Outcome, string> = {
		license: semantic.pass,
		unknown: semantic.warn,
		dropped: border.strong
	};

	// vertical layout: one node per stage, lanes as bands behind nirjas and atarashi
	const NODE_H = 32;
	const NODE_GAP = 10;
	const LANE_HEAD = 20;
	const PAD = 6;

	const layout = (() => {
		const ys = {} as Record<StageId, number>;
		const lanes: { group: Group; top: number; bottom: number }[] = [];
		let y = PAD;
		for (let i = 0; i < stages.length; i++) {
			const s = stages[i];
			const inLane = s.group === 'nirjas' || s.group === 'atarashi';
			if (inLane && stages[i - 1]?.group !== s.group) {
				lanes.push({ group: s.group, top: y, bottom: y });
				y += LANE_HEAD;
			}
			ys[s.id] = y;
			y += NODE_H;
			if (inLane && stages[i + 1]?.group !== s.group) {
				lanes[lanes.length - 1].bottom = y + 6;
				y += 6;
			}
			y += NODE_GAP;
		}
		return { ys, lanes, height: y - NODE_GAP + PAD };
	})();

	let ex = $state(0);
	let step = $state(0);
	let playing = $state(false);
	let reduced = $state(false);
	let hold = 0;

	const current = $derived(examples[ex]);
	const onPath = $derived(new Set(current.steps.map((s) => s.stage)));
	const visited = $derived(new Set(current.steps.slice(0, step + 1).map((s) => s.stage)));
	const active = $derived(current.steps[step].stage);
	const finished = $derived(step === current.steps.length - 1);

	const centre = (id: StageId) => layout.ys[id] + NODE_H / 2;
	const dotY = new Tween(centre('file'), { duration: 450, easing: cubicOut });

	$effect(() => {
		const target = centre(active);
		dotY.set(target, { duration: reduced || step === 0 ? 0 : 450 });
	});

	function advance() {
		if (step < current.steps.length - 1) {
			step += 1;
			return;
		}
		// linger on the result for two ticks, then move to the next example
		hold += 1;
		if (hold > 2) {
			hold = 0;
			ex = (ex + 1) % examples.length;
			step = 0;
		}
	}

	$effect(() => {
		if (!playing) return;
		const id = setInterval(advance, 1100);
		return () => clearInterval(id);
	});

	onMount(() => {
		reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		// reduced motion: no autoplay, and the static state is the finished path
		if (reduced) step = examples[ex].steps.length - 1;
		else playing = true;
	});

	function choose(i: number) {
		ex = i;
		hold = 0;
		step = reduced ? examples[i].steps.length - 1 : 0;
	}

	let width = $state(0);
	const nodeW = $derived(Math.max(0, width - PAD * 2));
	const DOT_X = PAD + 14;
	// JetBrains Mono advances ~0.6em; draw the sub-label only when both fit on one line
	const fits = (label: string, sub: string) =>
		DOT_X + 14 + label.length * 7.4 + 16 < PAD + nodeW - 10 - sub.length * 6.1;

	const btn =
		'border px-2 py-1 transition-colors focus-visible:outline-2 focus-visible:outline-uv-highlight';
	const on = 'border-uv-highlight bg-uv-raised text-uv-text-main';
	const off = 'border-uv-border text-uv-text-dim/70 hover:text-uv-text-main';
</script>

<div class="flex flex-col gap-3 p-4">
	<div
		class="flex flex-wrap items-center gap-2 font-mono text-[11px]"
		role="group"
		aria-label="example file"
	>
		{#each examples as e, i (e.name)}
			<button
				type="button"
				aria-pressed={ex === i}
				onclick={() => choose(i)}
				class="{btn} {ex === i ? on : off}"
			>
				{e.name}
			</button>
		{/each}
		<span class="ml-auto flex gap-2">
			<button
				type="button"
				aria-label="previous step"
				disabled={step === 0}
				onclick={() => {
					playing = false;
					step = Math.max(0, step - 1);
				}}
				class="{btn} {off} disabled:opacity-40">‹</button
			>
			<button
				type="button"
				aria-label={playing ? 'pause' : 'play'}
				aria-pressed={playing}
				onclick={() => {
					if (!playing && finished) step = 0;
					playing = !playing;
				}}
				class="{btn} {playing ? on : off} w-14">{playing ? 'pause' : 'play'}</button
			>
			<button
				type="button"
				aria-label="next step"
				disabled={finished}
				onclick={() => {
					playing = false;
					step = Math.min(current.steps.length - 1, step + 1);
				}}
				class="{btn} {off} disabled:opacity-40">›</button
			>
		</span>
	</div>

	<div class="grid gap-4 sm:grid-cols-2">
		<div bind:clientWidth={width}>
			{#if width > 0}
				<svg
					width="100%"
					height={layout.height}
					viewBox="0 0 {width} {layout.height}"
					role="img"
					aria-label="The pipeline for {current.name}: {current.steps
						.map((s) => stages.find((t) => t.id === s.stage)?.label)
						.join(', then ')}. Result: {current.result}. Currently at {stages.find(
						(t) => t.id === active
					)?.label}."
				>
					{#each layout.lanes as lane (lane.group)}
						<rect
							x={PAD - 4}
							y={lane.top}
							width={nodeW + 8}
							height={lane.bottom - lane.top}
							fill={surface.raised}
							opacity="0.6"
							stroke={groupColour[lane.group]}
							stroke-opacity="0.35"
						/>
						<text x={DOT_X + 14} y={lane.top + 13} font-size="10" fill={groupColour[lane.group]}
							>{lane.group}</text
						>
					{/each}

					<!-- the spine the file travels down; lit up to the current stage -->
					<line
						x1={DOT_X}
						y1={centre('file')}
						x2={DOT_X}
						y2={centre('out')}
						stroke={border.subtle}
						stroke-width="2"
					/>
					<line
						x1={DOT_X}
						y1={centre('file')}
						x2={DOT_X}
						y2={dotY.current}
						stroke={accent}
						stroke-width="2"
					/>

					{#each stages as s (s.id)}
						{@const y = layout.ys[s.id]}
						{@const isOn = onPath.has(s.id)}
						{@const seen = visited.has(s.id)}
						{@const isActive = s.id === active}
						{@const stroke =
							s.id === 'out' && seen && finished
								? outcomeColour[current.outcome]
								: seen
									? groupColour[s.group]
									: isOn
										? border.default
										: border.subtle}
						<g opacity={isOn ? 1 : 0.35}>
							<rect
								x={PAD}
								{y}
								width={nodeW}
								height={NODE_H}
								rx="3"
								fill={isActive ? surface.overlay : surface.deep}
								{stroke}
								stroke-width={isActive ? 2 : 1}
							/>
							<text x={DOT_X + 14} y={y + 20} font-size="12" fill={seen ? ink.primary : ink.dim}
								>{s.label}</text
							>
							{#if fits(s.label, isOn ? s.sub : 'skipped')}
								<text
									x={PAD + nodeW - 10}
									y={y + 20}
									font-size="10"
									text-anchor="end"
									fill={ink.dim}
									opacity="0.75">{isOn ? s.sub : 'skipped'}</text
								>
							{/if}
						</g>
					{/each}

					<circle
						cx={DOT_X}
						cy={dotY.current}
						r="6"
						fill={accent}
						stroke={surface.deep}
						stroke-width="2"
					/>
				</svg>
			{/if}
		</div>

		<div class="flex min-w-0 flex-col gap-3 font-mono text-[11px] leading-relaxed">
			<pre
				class="overflow-x-auto border border-uv-border/60 bg-uv-black p-2 text-[10.5px] whitespace-pre-wrap text-uv-text-main">{current.snippet}</pre>
			<ol class="flex flex-col gap-1" aria-live="polite">
				{#each current.steps as s, i (s.stage)}
					<li
						class="flex gap-2 transition-opacity {i <= step ? 'opacity-100' : 'opacity-30'} {i ===
						step
							? 'text-uv-text-main'
							: 'text-uv-text-dim/80'}"
					>
						<span class="w-20 shrink-0">{stages.find((t) => t.id === s.stage)?.label}</span>
						<span>{s.note}</span>
					</li>
				{/each}
			</ol>
			<p class="min-h-[1.5rem] text-uv-text-dim/70">
				{#if finished}
					result: <span class="text-uv-text-main">{current.result}</span>
				{/if}
			</p>
		</div>
	</div>
</div>

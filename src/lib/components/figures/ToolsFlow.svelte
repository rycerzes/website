<script lang="ts">
	import { onMount } from 'svelte';
	import { series, surface, text as ink, border } from '$lib/palette';

	const uid = $props.id();

	type Pt = [number, number];
	type Box = { x: number; y: number; w: number; h: number; lines: string[]; stroke: string };
	type Layout = {
		w: number;
		h: number;
		boxes: Record<'source' | 'nirjas' | 'skipped' | 'atarashi' | 'report' | 'minerva', Box>;
		gate: { c: Pt; r: number };
		edges: Pt[][];
		training: Pt[][];
		labels: { at: Pt; text: string }[];
		routes: { license: Pt[]; other: Pt[] };
	};

	const NIRJAS = series.blue;
	const ATARASHI = series.orange;
	const MINERVA = series.aqua;
	const LICENSE_PACKET = series.yellow;

	// wide: left to right, reads like the pipeline
	const wide: Layout = {
		w: 700,
		h: 226,
		boxes: {
			source: { x: 8, y: 62, w: 92, h: 36, lines: ['source tree'], stroke: border.default },
			nirjas: {
				x: 128,
				y: 52,
				w: 150,
				h: 56,
				lines: ['nirjas', 'tree-sitter comments'],
				stroke: NIRJAS
			},
			skipped: { x: 462, y: 18, w: 96, h: 34, lines: ['skipped'], stroke: border.default },
			atarashi: {
				x: 440,
				y: 122,
				w: 150,
				h: 56,
				lines: ['atarashi', 'which license + span'],
				stroke: ATARASHI
			},
			report: {
				x: 606,
				y: 128,
				w: 86,
				h: 44,
				lines: ['fossology', 'report'],
				stroke: border.default
			},
			minerva: {
				x: 128,
				y: 150,
				w: 150,
				h: 56,
				lines: ['minerva', 'datasets + evaluation'],
				stroke: MINERVA
			}
		},
		gate: { c: [360, 80], r: 44 },
		edges: [
			[
				[100, 80],
				[128, 80]
			],
			[
				[278, 80],
				[316, 80]
			],
			[
				[404, 80],
				[432, 35],
				[462, 35]
			],
			[
				[360, 124],
				[360, 150],
				[440, 150]
			],
			[
				[590, 150],
				[606, 150]
			]
		],
		training: [
			[
				[278, 168],
				[334, 106]
			],
			[
				[278, 192],
				[440, 170]
			]
		],
		labels: [
			{ at: [442, 66], text: 'no' },
			{ at: [376, 142], text: 'yes' },
			{ at: [318, 150], text: 'trains' },
			{ at: [380, 206], text: 'trains the ranker, scores both' }
		],
		routes: {
			license: [
				[54, 80],
				[203, 80],
				[360, 80],
				[360, 150],
				[515, 150],
				[649, 150]
			],
			other: [
				[54, 80],
				[203, 80],
				[360, 80],
				[404, 80],
				[432, 35],
				[510, 35]
			]
		}
	};

	// narrow: top to bottom, legible at 360px
	const narrow: Layout = {
		w: 300,
		h: 372,
		boxes: {
			source: { x: 100, y: 8, w: 100, h: 34, lines: ['source tree'], stroke: border.default },
			nirjas: {
				x: 60,
				y: 66,
				w: 180,
				h: 50,
				lines: ['nirjas', 'tree-sitter comments'],
				stroke: NIRJAS
			},
			skipped: { x: 212, y: 160, w: 84, h: 34, lines: ['skipped'], stroke: border.default },
			atarashi: {
				x: 60,
				y: 250,
				w: 180,
				h: 50,
				lines: ['atarashi', 'which license + span'],
				stroke: ATARASHI
			},
			report: { x: 85, y: 330, w: 130, h: 34, lines: ['fossology report'], stroke: border.default },
			minerva: {
				x: 4,
				y: 150,
				w: 88,
				h: 56,
				lines: ['minerva', 'data + eval'],
				stroke: MINERVA
			}
		},
		gate: { c: [150, 178], r: 40 },
		edges: [
			[
				[150, 42],
				[150, 66]
			],
			[
				[150, 116],
				[150, 138]
			],
			[
				[190, 178],
				[212, 177]
			],
			[
				[150, 218],
				[150, 250]
			],
			[
				[150, 300],
				[150, 330]
			]
		],
		training: [
			[
				[92, 178],
				[110, 178]
			],
			[
				[48, 206],
				[48, 275],
				[60, 275]
			]
		],
		labels: [
			{ at: [201, 170], text: 'no' },
			{ at: [164, 238], text: 'yes' }
		],
		routes: {
			license: [
				[150, 25],
				[150, 91],
				[150, 178],
				[150, 275],
				[150, 347]
			],
			other: [
				[150, 25],
				[150, 91],
				[150, 178],
				[254, 177]
			]
		}
	};

	let width = $state(0);
	const L = $derived(width > 0 && width < 480 ? narrow : wide);

	const pathD = (pts: Pt[]) => 'M ' + pts.map((p) => p.join(',')).join(' L ');
	const length = (pts: Pt[]) =>
		pts.slice(1).reduce((acc, p, i) => acc + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);

	function along(pts: Pt[], d: number): Pt {
		for (let i = 1; i < pts.length; i++) {
			const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
			if (d <= seg) {
				const t = seg === 0 ? 0 : d / seg;
				return [
					pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t,
					pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t
				];
			}
			d -= seg;
		}
		return pts[pts.length - 1];
	}

	// most comments are not license text; the cycle is illustrative, not a measured ratio
	const PATTERN: ('license' | 'other')[] = ['other', 'license', 'other', 'other', 'license'];
	const SPEED = 0.11; // viewBox units per ms
	const SPAWN_MS = 700;

	type Packet = { id: number; kind: 'license' | 'other'; born: number };
	let packets = $state<Packet[]>([]);
	let now = $state(0);
	let playing = $state(false);
	let reduced = $state(false);
	let seen = $state(0);
	let sent = $state(0);
	let skipped = $state(0);

	let nextId = 0;
	let clock = 0; // animation time, advances only while playing
	let lastFrame = 0;
	let lastSpawn = -Infinity;
	let raf = 0;

	function frame(t: number) {
		const dt = lastFrame ? Math.min(t - lastFrame, 64) : 16;
		lastFrame = t;
		clock += dt;
		if (clock - lastSpawn >= SPAWN_MS) {
			lastSpawn = clock;
			packets.push({ id: nextId, kind: PATTERN[nextId % PATTERN.length], born: clock });
			nextId += 1;
			seen += 1;
		}
		const alive: Packet[] = [];
		for (const p of packets) {
			if ((clock - p.born) * SPEED >= length(L.routes[p.kind])) {
				if (p.kind === 'license') sent += 1;
				else skipped += 1;
			} else alive.push(p);
		}
		packets = alive;
		now = clock;
		raf = requestAnimationFrame(frame);
	}

	$effect(() => {
		if (!playing) return;
		lastFrame = 0;
		raf = requestAnimationFrame(frame);
		return () => cancelAnimationFrame(raf);
	});

	onMount(() => {
		reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (!reduced) playing = true;
	});

	const btn =
		'border px-2 py-1 transition-colors focus-visible:outline-2 focus-visible:outline-uv-highlight';
</script>

<div class="flex flex-col gap-3 p-4" bind:clientWidth={width}>
	<div
		class="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] text-uv-text-dim/70"
	>
		<span class="flex items-center gap-1.5">
			<svg width="10" height="10" aria-hidden="true"
				><circle cx="5" cy="5" r="4" fill={LICENSE_PACKET} /></svg
			> license comment
		</span>
		<span class="flex items-center gap-1.5">
			<svg width="10" height="10" aria-hidden="true"
				><circle cx="5" cy="5" r="4" fill={ink.dim} /></svg
			> any other comment
		</span>
		<button
			type="button"
			aria-pressed={playing}
			onclick={() => (playing = !playing)}
			class="{btn} ml-auto {playing
				? 'border-uv-highlight bg-uv-raised text-uv-text-main'
				: 'border-uv-border text-uv-text-dim/70 hover:text-uv-text-main'}"
		>
			{playing ? 'pause' : 'play'}
		</button>
	</div>

	{#if width > 0}
		<svg
			width="100%"
			viewBox="0 0 {L.w} {L.h}"
			role="img"
			aria-label="How the tools fit: every comment in the source tree goes through Nirjas, which extracts it with Tree-sitter, and a gate asks whether it is license text. Comments that are not are skipped. License text goes to Atarashi, which names the license and its span for the FOSSology report. Minerva's datasets and evaluation train the gate and the ranker, and score both."
		>
			<defs>
				<marker
					id="{uid}-arrow"
					viewBox="0 0 10 10"
					refX="9"
					refY="5"
					markerWidth="6"
					markerHeight="6"
					orient="auto-start-reverse"
				>
					<path d="M 0 0 L 10 5 L 0 10 z" fill={ink.dim} />
				</marker>
			</defs>

			{#each L.edges as e, i (i)}
				<path
					d={pathD(e)}
					fill="none"
					stroke={ink.dim}
					stroke-opacity="0.6"
					stroke-width="1.2"
					marker-end="url(#{uid}-arrow)"
				/>
			{/each}
			{#each L.training as e, i (i)}
				<path
					d={pathD(e)}
					fill="none"
					stroke={MINERVA}
					stroke-width="1.2"
					stroke-dasharray="4 3"
					class="march"
					class:paused={!playing}
					marker-end="url(#{uid}-arrow)"
				/>
			{/each}
			{#each L.labels as l (l.text)}
				<text x={l.at[0]} y={l.at[1]} font-size="10" text-anchor="middle" fill={ink.dim}
					>{l.text}</text
				>
			{/each}

			<!-- packets travel under the nodes, so each one is visibly "inside" a tool -->
			{#each packets as p (p.id)}
				{@const pos = along(L.routes[p.kind], (now - p.born) * SPEED)}
				<circle
					cx={pos[0]}
					cy={pos[1]}
					r="4"
					fill={p.kind === 'license' ? LICENSE_PACKET : ink.dim}
				/>
			{/each}

			{#each Object.entries(L.boxes) as [key, b] (key)}
				<rect
					x={b.x}
					y={b.y}
					width={b.w}
					height={b.h}
					rx="3"
					fill={surface.raised}
					fill-opacity="0.92"
					stroke={b.stroke}
				/>
				{#each b.lines as line, i (i)}
					<text
						x={b.x + b.w / 2}
						y={b.y + b.h / 2 + (i - (b.lines.length - 1) / 2) * 16 + 4}
						font-size={i === 0 ? 12 : 10}
						text-anchor="middle"
						fill={i === 0 ? ink.primary : ink.dim}
						font-style={i === 0 ? 'normal' : 'italic'}>{line}</text
					>
				{/each}
			{/each}

			<polygon
				points="{L.gate.c[0]},{L.gate.c[1] - L.gate.r} {L.gate.c[0] + L.gate.r},{L.gate.c[1]} {L
					.gate.c[0]},{L.gate.c[1] + L.gate.r} {L.gate.c[0] - L.gate.r},{L.gate.c[1]}"
				fill={surface.raised}
				fill-opacity="0.92"
				stroke={NIRJAS}
			/>
			<text
				x={L.gate.c[0]}
				y={L.gate.c[1] - 4}
				font-size="12"
				text-anchor="middle"
				fill={ink.primary}>gate</text
			>
			<text
				x={L.gate.c[0]}
				y={L.gate.c[1] + 12}
				font-size="10"
				font-style="italic"
				text-anchor="middle"
				fill={ink.dim}>license text?</text
			>
		</svg>
	{/if}

	<p class="min-h-[1.5rem] font-mono text-[11px] leading-relaxed text-uv-text-dim/70">
		{#if reduced && !playing && seen === 0}
			Every comment passes through Nirjas; only license text reaches Atarashi. Press play to watch
			it flow.
		{:else}
			comments seen <span class="unit text-uv-text-main">{seen}</span> · sent to atarashi
			<span class="unit text-uv-text-main">{sent}</span> · skipped
			<span class="unit text-uv-text-main">{skipped}</span>
		{/if}
	</p>
</div>

<style>
	.march {
		animation: march 1.2s linear infinite;
	}
	.march.paused {
		animation-play-state: paused;
	}
	@keyframes march {
		to {
			stroke-dashoffset: -14;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.march {
			animation: none;
		}
	}
</style>

<script lang="ts">
	import { onMount } from 'svelte';
	import { accent, border, surface, text as ink } from '$lib/palette';
	import { beamData, depthColour } from '$lib/figures/insideBeam';

	// [layer, expert, x, y, subject index, significant, coherent, name]
	type Point = [number, number, number, number, number, number, number, string];
	type MapData = { subjects: string[]; points: Point[] };
	const data = beamData<MapData>('map');

	const counts = data.subjects.map((_, s) => data.points.filter((p) => p[4] === s).length);
	const SUBJECTS = data.subjects
		.map((name, i) => ({ name, i, n: counts[i] }))
		.filter((s) => s.name !== 'none')
		.sort((a, b) => b.n - a.n);

	let width = $state(0);
	let subject = $state(-1);
	let sigOnly = $state(false);
	let hover = $state<Point | null>(null);
	let canvas = $state<HTMLCanvasElement | null>(null);

	const H = $derived(Math.min(440, Math.max(300, (width - 32) * 0.72)));
	const PAD = 10;
	const sx = (v: number) => PAD + v * (width - 32 - 2 * PAD);
	const sy = (v: number) => PAD + (1 - v) * (H - 2 * PAD);

	// grid index for nearest-point lookup
	const CELLS = 40;
	const grid: Record<number, Point[]> = {};
	for (const p of data.points) {
		const k =
			Math.min(CELLS - 1, Math.floor(p[2] * CELLS)) * CELLS +
			Math.min(CELLS - 1, Math.floor(p[3] * CELLS));
		(grid[k] ??= []).push(p);
	}

	function nearest(px: number, py: number): Point | null {
		const fx = (px - PAD) / (width - 32 - 2 * PAD);
		const fy = 1 - (py - PAD) / (H - 2 * PAD);
		const cx = Math.floor(fx * CELLS);
		const cy = Math.floor(fy * CELLS);
		let best: Point | null = null;
		let bestD = 64;
		for (let i = cx - 1; i <= cx + 1; i++)
			for (let j = cy - 1; j <= cy + 1; j++)
				for (const p of grid[i * CELLS + j] ?? []) {
					if (sigOnly && !p[5]) continue;
					const d = (sx(p[2]) - px) ** 2 + (sy(p[3]) - py) ** 2;
					if (d < bestD) {
						bestD = d;
						best = p;
					}
				}
		return best;
	}

	function draw() {
		if (!canvas || width === 0) return;
		const dpr = window.devicePixelRatio || 1;
		const w = width - 32;
		canvas.width = w * dpr;
		canvas.height = H * dpr;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.scale(dpr, dpr);
		ctx.fillStyle = surface.raised;
		ctx.fillRect(0, 0, w, H);
		const focus = subject >= 0;
		// background pass, then the highlighted subject on top
		for (const p of data.points) {
			if (sigOnly && !p[5]) continue;
			if (focus && p[4] === subject) continue;
			ctx.globalAlpha = focus ? 0.12 : p[5] ? 0.95 : 0.45;
			ctx.fillStyle = depthColour(p[0]);
			ctx.fillRect(sx(p[2]) - 1, sy(p[3]) - 1, p[5] ? 2.6 : 2, p[5] ? 2.6 : 2);
		}
		if (focus) {
			ctx.globalAlpha = 1;
			ctx.fillStyle = accent;
			for (const p of data.points) {
				if (p[4] !== subject || (sigOnly && !p[5])) continue;
				ctx.fillRect(sx(p[2]) - 1.5, sy(p[3]) - 1.5, 3, 3);
			}
		}
		if (hover) {
			ctx.globalAlpha = 1;
			ctx.strokeStyle = ink.primary;
			ctx.lineWidth = 1.5;
			ctx.beginPath();
			ctx.arc(sx(hover[2]), sy(hover[3]), 5, 0, Math.PI * 2);
			ctx.stroke();
		}
	}

	$effect(() => {
		void [width, subject, sigOnly, hover, H];
		draw();
	});

	onMount(draw);

	function onMove(e: PointerEvent) {
		const r = (e.currentTarget as HTMLCanvasElement).getBoundingClientRect();
		hover = nearest(e.clientX - r.left, e.clientY - r.top);
	}

	function randomPick() {
		const pool = data.points.filter((p) => p[5] && p[7] && (subject < 0 || p[4] === subject));
		if (pool.length) hover = pool[Math.floor(Math.random() * pool.length)];
	}

	const btn =
		'border px-2 py-1 transition-colors focus-visible:outline-2 focus-visible:outline-uv-highlight';
</script>

<div class="flex flex-col gap-3 p-4 font-mono text-[11px]" bind:clientWidth={width}>
	<div class="flex flex-wrap items-center gap-2">
		<label for="map-subject" class="text-uv-text-dim/70">subject</label>
		<select
			id="map-subject"
			bind:value={subject}
			class="border border-uv-border bg-uv-raised px-2 py-1 text-uv-text-main focus-visible:outline-2 focus-visible:outline-uv-highlight"
		>
			<option value={-1}>all, coloured by depth</option>
			{#each SUBJECTS as s (s.i)}
				<option value={s.i}>{s.name} ({s.n})</option>
			{/each}
		</select>
		<button
			type="button"
			aria-pressed={sigOnly}
			onclick={() => (sigOnly = !sigOnly)}
			class="{btn} {sigOnly
				? 'border-uv-highlight bg-uv-raised text-uv-text-main'
				: 'border-uv-border text-uv-text-dim/70 hover:text-uv-text-main'}">steers only</button
		>
		<button
			type="button"
			onclick={randomPick}
			class="{btn} border-uv-border text-uv-text-dim/70 hover:text-uv-text-main"
			>random labelled expert</button
		>
	</div>

	{#if width > 0}
		<div
			role="img"
			aria-label="UMAP of the top write direction of all 12,544 routed experts. Position follows depth from left to right; experts Beam gave the same subject cluster together.{hover
				? ` Selected: layer ${hover[0]} expert ${hover[1]}${hover[7] ? `, ${hover[7]}` : ''}.`
				: ''}"
		>
			<canvas
				bind:this={canvas}
				aria-hidden="true"
				style="width: {width - 32}px; height: {H}px; border: 1px solid {border.subtle}"
				onpointermove={onMove}
				onpointerleave={() => (hover = null)}
			></canvas>
		</div>
	{/if}

	<p class="min-h-[2.5rem] leading-relaxed text-uv-text-dim/70">
		{#if hover}
			<span class="text-uv-text-main">L{hover[0]} E{hover[1]}</span>
			{#if hover[7]}— <span class="text-uv-text-main normal-case">{hover[7]}</span>{/if}
			· {hover[4] >= 0 ? data.subjects[hover[4]] : 'no label'}{hover[5]
				? ' · steers beyond controls'
				: ''}
		{:else}
			Hover a point. Larger points steer Beam beyond matched controls; names show where the label
			was tested and held.
		{/if}
	</p>
</div>

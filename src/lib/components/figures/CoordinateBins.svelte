<script lang="ts">
	const BINS = 999;
	/** Bins either side of the current one; the window is always this wide. */
	const WINDOW = 6;
	const SPAN = WINDOW * 2 + 1;

	/** Fixed heights: this is a 1D axis, so deriving one from width would only add dead space. */
	const AXIS_Y = 20;
	const FAN_TOP = 28;
	const FAN_BOTTOM = 50;
	const ZOOM_Y = 70;
	const ZOOM_HALF = 16;
	const SVG_H = 108;

	let width = $state(0);
	let xNorm = $state(0.4237);
	let imageWidth = $state(1440);

	// the paper's scheme truncates rather than rounds, so a bin reconstructs to its
	// left edge and the recovered value is never above the true one
	const bin = $derived(Math.min(BINS, Math.trunc(xNorm * BINS)));
	const reconstructed = $derived(bin / BINS);
	const errorPx = $derived(Math.abs(xNorm - reconstructed) * imageWidth);
	const binPx = $derived(imageWidth / BINS);

	const pad = 16;
	const inner = $derived(Math.max(0, width - pad * 2));

	// slide a fixed-width window rather than clamping its size, so magnification
	// stays constant as the reader drags toward either end of the axis
	// The overview marker travels left-to-right as the coordinate grows, so the detail
	// marker has to as well or the two views contradict each other. Page the window in
	// fixed blocks rather than scrolling it under a pinned marker: the bins hold still,
	// the marker sweeps across them, and crossing a block boundary is one legible jump.
	const lo = $derived(Math.min(Math.floor(bin / SPAN) * SPAN, BINS + 1 - SPAN));
	const hi = $derived(lo + SPAN - 1);
	const ticks = $derived(Array.from({ length: SPAN + 1 }, (_, i) => lo + i));
	const zoomX = $derived((value: number) => ((value - lo) / SPAN) * inner);
	const binW = $derived(inner / SPAN);
	/** The window's extent back in overview space, drawn as a field-of-view box. */
	const fovX = $derived((lo / (BINS + 1)) * inner);
	const fovW = $derived((SPAN / (BINS + 1)) * inner);
	const showLo = $derived(bin - lo >= 2);
	const showHi = $derived(hi - bin >= 2);
</script>

<div class="flex flex-col gap-3 p-4" bind:clientWidth={width}>
	{#if width > 0}
		<svg
			width="100%"
			height={SVG_H}
			viewBox="0 0 {width} {SVG_H}"
			role="img"
			aria-label="Coordinate {xNorm.toFixed(
				4
			)} falls in bin {bin}, which reconstructs to {reconstructed.toFixed(
				4
			)} — an error of {errorPx.toFixed(2)} pixels at {imageWidth} pixels wide."
		>
			<!-- overview: the whole 0..1 range -->
			<g transform="translate({pad}, {AXIS_Y})">
				<line x1="0" y1="0" x2={inner} y2="0" stroke="var(--color-uv-border)" stroke-width="1" />
				<rect
					x={fovX}
					y="-6"
					width={Math.max(fovW, 1.5)}
					height="12"
					fill="var(--color-uv-highlight)"
					opacity="0.25"
					stroke="var(--color-uv-highlight)"
					stroke-width="0.75"
				/>
				<line
					x1={xNorm * inner}
					y1="-7"
					x2={xNorm * inner}
					y2="7"
					stroke="var(--color-uv-text-main)"
					stroke-width="1.5"
				/>
				<text x="0" y="-8" font-size="10" fill="var(--color-uv-text-dim)" opacity="0.6">0.0</text>
				<text
					x={inner}
					y="-8"
					font-size="10"
					text-anchor="end"
					fill="var(--color-uv-text-dim)"
					opacity="0.6">1.0</text
				>
			</g>

			<!-- fan: shows the strip below is a magnification of ~1% of the axis above -->
			<path
				d="M {pad + fovX} {FAN_TOP} L {pad + fovX + Math.max(fovW, 1.5)} {FAN_TOP} L {pad +
					inner} {FAN_BOTTOM} L {pad} {FAN_BOTTOM} Z"
				fill="var(--color-uv-highlight)"
				opacity="0.07"
			/>

			<!-- zoom: individual bins, constant magnification -->
			<g transform="translate({pad}, {ZOOM_Y})">
				<rect
					x={zoomX(bin)}
					y={-ZOOM_HALF}
					width={binW}
					height={ZOOM_HALF * 2}
					fill="var(--color-uv-highlight)"
					opacity="0.16"
				/>
				<line
					x1="0"
					y1={ZOOM_HALF}
					x2={inner}
					y2={ZOOM_HALF}
					stroke="var(--color-uv-border)"
					stroke-width="1"
				/>
				{#each ticks as t (t)}
					<line
						x1={zoomX(t)}
						y1={-ZOOM_HALF}
						x2={zoomX(t)}
						y2={ZOOM_HALF}
						stroke="var(--color-uv-border-strong)"
						stroke-width="1"
					/>
				{/each}

				<!-- reconstruction sits on the bin's left edge; the dash to the dot is the error -->
				<line
					x1={zoomX(bin)}
					y1={-ZOOM_HALF}
					x2={zoomX(bin)}
					y2={ZOOM_HALF}
					stroke="var(--color-uv-highlight)"
					stroke-width="2"
				/>
				<line
					x1={zoomX(bin)}
					y1="0"
					x2={zoomX(xNorm * BINS)}
					y2="0"
					stroke="var(--color-uv-text-dim)"
					stroke-width="1"
					stroke-dasharray="2 2"
				/>
				<circle cx={zoomX(xNorm * BINS)} cy="0" r="3" fill="var(--color-uv-text-main)" />

				{#if showLo}
					<text
						x="0"
						y={ZOOM_HALF + 14}
						font-size="10"
						fill="var(--color-uv-text-dim)"
						opacity="0.6">{lo}</text
					>
				{/if}
				{#if showHi}
					<text
						x={inner}
						y={ZOOM_HALF + 14}
						font-size="10"
						text-anchor="end"
						fill="var(--color-uv-text-dim)"
						opacity="0.6">{hi}</text
					>
				{/if}
				<text
					x={zoomX(bin) + binW / 2}
					y={ZOOM_HALF + 14}
					font-size="10"
					text-anchor="middle"
					fill="var(--color-uv-text-main)">{bin}</text
				>
			</g>
		</svg>
	{/if}

	<dl class="grid grid-cols-4 gap-x-3 gap-y-1 font-mono text-[11px]">
		<div>
			<dt class="text-uv-text-dim/60">x_norm</dt>
			<dd class="text-uv-text-main">{xNorm.toFixed(5)}</dd>
		</div>
		<div>
			<dt class="text-uv-text-dim/60">bin</dt>
			<dd class="text-violet-300">&lt;{bin}&gt;</dd>
		</div>
		<div>
			<dt class="text-uv-text-dim/60">recon</dt>
			<dd class="text-uv-text-main">{reconstructed.toFixed(5)}</dd>
		</div>
		<div>
			<dt class="text-uv-text-dim/60">error</dt>
			<dd class="text-uv-text-main">{errorPx.toFixed(2)} px</dd>
		</div>
	</dl>

	<div class="flex flex-col gap-2">
		<div class="flex items-center gap-3">
			<label for="coord-x" class="w-24 shrink-0 font-mono text-[11px] text-uv-text-dim/70">
				coordinate
			</label>
			<input
				id="coord-x"
				type="range"
				min="0"
				max="1"
				step="0.0001"
				bind:value={xNorm}
				class="h-1 w-full cursor-pointer appearance-none bg-uv-mute accent-violet-400"
			/>
		</div>
		<div class="flex items-center gap-3">
			<label for="coord-w" class="w-24 shrink-0 font-mono text-[11px] text-uv-text-dim/70">
				image width
			</label>
			<input
				id="coord-w"
				type="range"
				min="256"
				max="4096"
				step="16"
				bind:value={imageWidth}
				class="h-1 w-full cursor-pointer appearance-none bg-uv-mute accent-violet-400"
			/>
			<span class="w-20 shrink-0 text-right font-mono text-[11px] text-uv-text-dim">
				{imageWidth}px
			</span>
		</div>
	</div>

	<p class="font-mono text-[11px] leading-relaxed text-uv-text-dim/60">
		One bin spans {binPx.toFixed(2)} px at this width — the precision ceiling of the scheme, regardless
		of how good the model is.
	</p>
</div>

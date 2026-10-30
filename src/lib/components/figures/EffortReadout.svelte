<script lang="ts">
	import { border, categorical, text as ink } from '$lib/palette';
	import { beamData, linear } from '$lib/figures/insideBeam';

	type Effort = { readout: Record<string, number[]>; best_layer: Record<string, number> };
	const effort = beamData<Effort>('effort');

	const SERIES = [
		{ key: 'n_last', name: 'last digit of N' },
		{ key: 'sys_end', name: 'end of system message' },
		{ key: 'think_start', name: 'start of thinking' },
		{ key: 'thought1', name: 'first thought token' }
	].map((s, i) => ({ ...s, colour: categorical[i] }));

	let width = $state(0);
	let hidden = $state<string[]>([]);
	let at = $state<number | null>(null);

	const H = 240;
	const PAD = { l: 36, r: 12, t: 12, b: 30 };
	const plotW = $derived(Math.max(0, width - 32 - PAD.l - PAD.r));
	const x = $derived(linear(0, 51, PAD.l, PAD.l + plotW));
	const y = linear(0, 1, H - PAD.b, PAD.t);
	const path = (vals: number[]) =>
		vals
			.map((v, l) => `${l ? 'L' : 'M'}${x(l).toFixed(1)},${y(Math.max(0, v)).toFixed(1)}`)
			.join('');

	function onMove(e: PointerEvent) {
		const r = (e.currentTarget as SVGElement).getBoundingClientRect();
		const l = Math.round(((e.clientX - r.left - PAD.l) / plotW) * 51);
		at = l >= 0 && l <= 51 ? l : null;
	}
</script>

<div class="flex flex-col gap-3 p-4 font-mono text-[11px]" bind:clientWidth={width}>
	<div class="flex flex-wrap gap-x-3 gap-y-1.5">
		{#each SERIES as s (s.key)}
			{@const off = hidden.includes(s.key)}
			<button
				type="button"
				aria-pressed={!off}
				onclick={() => (hidden = off ? hidden.filter((h) => h !== s.key) : [...hidden, s.key])}
				class="flex items-center gap-1.5 px-1 py-0.5 focus-visible:outline-2 focus-visible:outline-uv-highlight {off
					? 'text-uv-text-dim/40'
					: 'text-uv-text-dim'}"
			>
				<span
					class="inline-block h-3 w-3 rounded-[2px] border"
					style="background: {off ? 'transparent' : s.colour}; border-color: {border.default}"
				></span>
				{s.name}
			</button>
		{/each}
	</div>

	{#if width > 0}
		<svg
			width="100%"
			height={H}
			viewBox="0 0 {width - 32} {H}"
			role="img"
			aria-label="Held-out R² of a linear readout of log2 of the reasoning-effort setting, by layer, at four positions. Best: {SERIES.map(
				(s) =>
					`${s.name} ${effort.readout[s.key][effort.best_layer[s.key]].toFixed(3)} at layer ${effort.best_layer[s.key]}`
			).join('; ')}."
			onpointermove={onMove}
			onpointerleave={() => (at = null)}
		>
			{#each [0, 0.25, 0.5, 0.75, 1] as t (t)}
				<line x1={PAD.l} x2={PAD.l + plotW} y1={y(t)} y2={y(t)} stroke={border.subtle} />
				<text x={PAD.l - 6} y={y(t) + 3.5} font-size="10" text-anchor="end" fill={ink.dim}>{t}</text
				>
			{/each}
			{#each [0, 3, 12, 24, 36, 51] as l (l)}
				<text x={x(l)} y={H - PAD.b + 15} font-size="10" text-anchor="middle" fill={ink.dim}
					>L{l}</text
				>
			{/each}
			<text x={4} y={PAD.t - 2} font-size="10" fill={ink.dim}>R²</text>
			{#each SERIES as s (s.key)}
				{#if !hidden.includes(s.key)}
					<path d={path(effort.readout[s.key])} fill="none" stroke={s.colour} stroke-width="2" />
				{/if}
			{/each}
			{#if at !== null}
				<line x1={x(at)} x2={x(at)} y1={PAD.t} y2={H - PAD.b} stroke={border.strong} />
			{/if}
		</svg>
	{/if}

	<p class="min-h-[2.5rem] leading-relaxed text-uv-text-dim/70">
		{#if at !== null}
			<span class="text-uv-text-main">layer {at}</span>:
			{SERIES.filter((s) => !hidden.includes(s.key))
				.map((s) => `${s.name} ${Math.max(0, effort.readout[s.key][at ?? 0]).toFixed(3)}`)
				.join(' · ')}
		{:else}
			One linear direction per layer, fit on 200 GSM8K questions at efforts 8–512 and scored on
			held-out questions. Hover for values.
		{/if}
	</p>
</div>

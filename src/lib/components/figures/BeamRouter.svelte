<script lang="ts">
	import { onMount } from 'svelte';
	import { accent, border, series, surface, text as ink } from '$lib/palette';
	import { mix } from '$lib/figures/insideBeam';

	// One MoE layer's router for one token. Logits are synthetic; the selection rule, the group
	// structure and the size of the correction bias are Beam's (config.json and the weights).
	const GROUPS = 8;
	const PER = 32;
	const N = GROUPS * PER;
	const BIAS = 18.4; // near-constant per layer; per-expert deviations are 1e-5 to 2e-2

	const STEPS = [
		'score every expert: sigmoid(router logit) + correction bias',
		'score each group of 32 by the sum of its two best experts',
		'keep the 4 best of the 8 groups',
		'pick the 8 best experts inside those groups'
	];

	function rng(seed: number) {
		let a = seed >>> 0;
		return () => {
			a = (a + 0x6d2b79f5) >>> 0;
			let t = a;
			t = Math.imul(t ^ (t >>> 15), t | 1);
			t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}

	function token(seed: number) {
		const r = rng(seed);
		const gauss = () => Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r());
		const groupLift = Array.from({ length: GROUPS }, () => gauss() * 0.45);
		return Array.from({ length: N }, (_, i) => {
			const logit = -3 + groupLift[Math.floor(i / PER)] + gauss() * 1.4;
			return { s: 1 / (1 + Math.exp(-logit)), dev: (r() - 0.5) * 0.02 };
		});
	}

	let seed = $state(7);
	let banned = $state<number[]>([]);
	let step = $state(3);
	let playing = $state(false);
	let width = $state(0);

	const experts = $derived(token(seed));
	const choice = $derived(
		experts.map((e, i) => (banned.includes(i) ? e.s + e.dev - 1000 : e.s + e.dev))
	);
	const groupScore = $derived(
		Array.from({ length: GROUPS }, (_, g) => {
			const top = choice
				.slice(g * PER, (g + 1) * PER)
				.sort((a, b) => b - a)
				.slice(0, 2);
			return top[0] + top[1];
		})
	);
	const keptGroups = $derived(
		[...groupScore.keys()].sort((a, b) => groupScore[b] - groupScore[a]).slice(0, 4)
	);
	const picked = $derived(
		[...choice.keys()]
			.filter((i) => keptGroups.includes(Math.floor(i / PER)))
			.sort((a, b) => choice[b] - choice[a])
			.slice(0, 8)
	);
	const weights = $derived.by(() => {
		const total = picked.reduce((acc, i) => acc + experts[i].s, 0);
		return picked.map((i) => ({ i, w: experts[i].s / total }));
	});

	const LABEL_W = 30;
	const BAR_W = 64;
	const cell = $derived(Math.max(7, Math.floor((width - 32 - LABEL_W - BAR_W) / PER)));
	const gridW = $derived(cell * PER);
	const rowH = $derived(cell + 4);
	const svgW = $derived(LABEL_W + gridW + BAR_W);
	const svgH = $derived(GROUPS * rowH + 4);
	const maxGroup = $derived(Math.max(...groupScore.map((v) => Math.max(v, 0)), 1e-6));

	function toggleBan(i: number) {
		banned = banned.includes(i) ? banned.filter((b) => b !== i) : [...banned, i];
		step = 3;
	}

	function banTop() {
		const top = weights.slice().sort((a, b) => b.w - a.w)[0];
		if (top) toggleBan(top.i);
	}

	let timer = 0;
	$effect(() => {
		if (!playing) return;
		timer = window.setInterval(() => {
			if (step < 3) step += 1;
			else {
				seed += 1;
				step = 0;
			}
		}, 1400);
		return () => window.clearInterval(timer);
	});

	onMount(() => {
		if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			step = 0;
			playing = true;
		}
	});

	const btn =
		'border px-2 py-1 transition-colors focus-visible:outline-2 focus-visible:outline-uv-highlight';
	const off = 'border-uv-border text-uv-text-dim/70 hover:text-uv-text-main';
	const on = 'border-uv-highlight bg-uv-raised text-uv-text-main';

	const label = $derived(
		`Router for one token: 256 experts in 8 groups of 32. Kept groups ${keptGroups
			.map((g) => g)
			.join(', ')}; picked experts ${picked.join(', ')}${
			banned.length ? `; banned ${banned.join(', ')}` : ''
		}.`
	);
</script>

<div class="flex flex-col gap-3 p-4" bind:clientWidth={width}>
	<div class="flex flex-wrap items-center gap-2 font-mono text-[11px]">
		{#each STEPS as _, i (i)}
			<button
				type="button"
				class="{btn} {step === i ? on : off}"
				aria-pressed={step === i}
				onclick={() => {
					playing = false;
					step = i;
				}}>{i + 1}</button
			>
		{/each}
		<button
			type="button"
			class="{btn} {playing ? on : off}"
			aria-pressed={playing}
			onclick={() => (playing = !playing)}>{playing ? 'pause' : 'play'}</button
		>
		<span class="ml-auto flex gap-2">
			<button
				type="button"
				class="{btn} {off}"
				onclick={() => {
					playing = false;
					banTop();
				}}>ban top pick</button
			>
			<button
				type="button"
				class="{btn} {off}"
				onclick={() => {
					playing = false;
					banned = [];
					seed += 1;
				}}>new token</button
			>
		</span>
	</div>

	<p class="min-h-[1.5rem] font-mono text-[11px] text-uv-text-main">
		{step + 1}. {STEPS[step]}
	</p>

	{#if width > 0}
		<div class="overflow-x-auto">
			<svg width={svgW} height={svgH} viewBox="0 0 {svgW} {svgH}" role="img" aria-label={label}>
				{#each Array.from({ length: GROUPS }, (_, g) => g) as g (g)}
					{@const y = 2 + g * rowH}
					{@const kept = step >= 2 && keptGroups.includes(g)}
					{@const dimmed = step >= 2 && !kept}
					<text
						x={LABEL_W - 6}
						y={y + cell / 2 + 3.5}
						font-size="10"
						text-anchor="end"
						fill={kept ? ink.primary : ink.dim}>g{g}</text
					>
					{#if kept}
						<rect
							x={LABEL_W - 2}
							y={y - 2}
							width={gridW + 3}
							height={cell + 4}
							fill="none"
							stroke={accent}
							stroke-opacity="0.6"
						/>
					{/if}
					{#each Array.from({ length: PER }, (_, k) => g * PER + k) as i (i)}
						{@const x = LABEL_W + (i % PER) * cell}
						{@const isBanned = banned.includes(i)}
						{@const isPicked = step === 3 && picked.includes(i)}
						<rect
							{x}
							{y}
							width={cell - 1}
							height={cell - 1}
							role="presentation"
							class="cursor-pointer"
							fill={isPicked ? accent : mix(surface.raised, series.blue, experts[i].s)}
							opacity={dimmed && !isPicked ? 0.25 : 1}
							stroke={isPicked ? ink.primary : 'none'}
							onclick={() => {
								playing = false;
								toggleBan(i);
							}}
						/>
						{#if isBanned}
							<path
								d="M{x + 2} {y + 2} L{x + cell - 3} {y + cell - 3} M{x + cell - 3} {y + 2} L{x +
									2} {y + cell - 3}"
								stroke={ink.primary}
								stroke-width="1.5"
								pointer-events="none"
							/>
						{/if}
					{/each}
					{#if step >= 1}
						<rect
							x={LABEL_W + gridW + 8}
							y={y + 1}
							width={Math.max(0, (groupScore[g] / maxGroup) * (BAR_W - 14))}
							height={cell - 3}
							fill={kept ? accent : border.strong}
						/>
					{/if}
				{/each}
			</svg>
		</div>
	{/if}

	<div
		class="grid grid-cols-4 gap-x-3 gap-y-1 font-mono text-[11px] transition-opacity sm:grid-cols-8 {step ===
		3
			? 'opacity-100'
			: 'opacity-0'}"
		aria-hidden={step !== 3}
	>
		{#each weights as { i, w } (i)}
			<div class="flex flex-col">
				<span class="text-uv-text-main">e{i}</span>
				<span class="text-uv-text-dim/70">{(w * 100).toFixed(1)}%</span>
			</div>
		{/each}
	</div>

	<p class="font-mono text-[11px] leading-relaxed text-uv-text-dim/70">
		Bias here is {BIAS} ± 0.01 for every expert, so it only breaks near-ties. The 8 weights come from
		the sigmoid scores alone. Click a cell, or <span class="text-uv-text-main">ban top pick</span>,
		to set that expert's bias to −1000: it can never be chosen, and the router fills its slot from
		what is left.
		{#if banned.length}Banned: {banned.map((b) => `e${b}`).join(', ')}.{/if}
	</p>
</div>

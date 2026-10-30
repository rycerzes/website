<script lang="ts">
	import { onMount } from 'svelte';
	import { beamData, plain, showToken } from '$lib/figures/insideBeam';

	type Out = { final: string; status: string };
	type Example = {
		id: string;
		layer: number;
		expert: number;
		name: string;
		desc: string;
		subject: string;
		tokens: string[];
		theme: string[];
		pct: number;
		judge: boolean | null;
		judge_beam: boolean | null;
		out: Record<string, Record<string, Out>>;
	};
	type Data = {
		prompts: Record<string, string>;
		baseline: Record<string, Out>;
		examples: Example[];
	};
	const data = beamData<Data>('steered');
	const PROMPTS = ['who', 'snake', 'orange', 'effort'];
	const DOSES = ['0', '0.4', '1.0'];

	let pick = $state(0);
	let prompt = $state('who');
	let dose = $state('1.0');
	let reduced = $state(true);
	let shown = $state(0);

	const ex = $derived(data.examples[pick]);
	const available = $derived(DOSES.filter((d) => d === '0' || ex.out[prompt]?.[d]));
	const doseNow = $derived(available.includes(dose) ? dose : available[available.length - 1]);
	const out = $derived(doseNow === '0' ? data.baseline[prompt] : ex.out[prompt]?.[doseNow]);
	const textNow = $derived(plain(out?.final ?? ''));

	// type the answer out; reduced motion shows it at once
	$effect(() => {
		const full = textNow.length;
		if (reduced) {
			shown = full;
			return;
		}
		shown = 0;
		const id = window.setInterval(() => {
			shown = Math.min(full, shown + 4);
			if (shown >= full) window.clearInterval(id);
		}, 16);
		return () => window.clearInterval(id);
	});

	onMount(() => {
		reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	});

	const btn =
		'border px-2 py-1 transition-colors focus-visible:outline-2 focus-visible:outline-uv-highlight';
	const on = 'border-uv-highlight bg-uv-raised text-uv-text-main';
	const off = 'border-uv-border text-uv-text-dim/70 hover:text-uv-text-main';
	const DOSE_NAME: Record<string, string> = { '0': 'off', '0.4': 'gentle', '1.0': 'full' };
</script>

<div class="flex flex-col gap-3 p-4 font-mono text-[11px]">
	<div class="flex flex-wrap gap-1.5" role="group" aria-label="expert">
		{#each data.examples as e, i (e.id)}
			<button
				type="button"
				aria-pressed={pick === i}
				class="{btn} {pick === i ? on : off}"
				onclick={() => (pick = i)}>{e.name.toLowerCase()}</button
			>
		{/each}
	</div>

	<div class="flex flex-wrap items-center gap-x-4 gap-y-2">
		<div class="flex flex-wrap gap-1.5" role="group" aria-label="question">
			{#each PROMPTS as p (p)}
				<button
					type="button"
					aria-pressed={prompt === p}
					class="{btn} {prompt === p ? on : off}"
					onclick={() => (prompt = p)}>{p === 'effort' ? 'bat & ball' : p}</button
				>
			{/each}
		</div>
		<div class="flex gap-1.5" role="group" aria-label="push strength">
			{#each DOSES as d (d)}
				<button
					type="button"
					aria-pressed={doseNow === d}
					disabled={!available.includes(d)}
					class="{btn} disabled:opacity-30 {doseNow === d ? on : off}"
					onclick={() => (dose = d)}>{DOSE_NAME[d]}</button
				>
			{/each}
		</div>
	</div>

	<div class="grid gap-3 sm:grid-cols-[1fr_11rem]">
		<div class="flex flex-col gap-2 border border-uv-mute bg-uv-raised p-3">
			<p class="text-uv-text-dim/70 normal-case">› {data.prompts[prompt]}</p>
			<p
				class="min-h-[9rem] text-[12px] leading-relaxed whitespace-pre-wrap text-uv-text-main normal-case"
				aria-live="polite"
			>
				{textNow.slice(0, shown)}{#if shown < textNow.length}<span class="text-uv-highlight">▍</span
					>{/if}
			</p>
			<p class="text-uv-text-dim/60">
				{#if doseNow === '0'}unsteered Beam{:else}L{ex.layer} E{ex.expert}, + pole, {DOSE_NAME[
						doseNow
					]} push{/if}{#if out?.status === 'budget'}
					· cut at the 160-token budget{/if}
			</p>
		</div>
		<dl class="flex flex-col gap-2">
			<div>
				<dt class="text-uv-text-dim/60">beam's label</dt>
				<dd class="text-uv-text-main normal-case">{ex.name}</dd>
			</div>
			<div>
				<dt class="text-uv-text-dim/60">top tokens</dt>
				<dd class="flex flex-wrap gap-1 normal-case">
					{#each ex.tokens as t, i (i)}
						<span class="border border-uv-mute px-1 text-uv-text-main">{showToken(t)}</span>
					{/each}
				</dd>
			</div>
			<div>
				<dt class="text-uv-text-dim/60">checks</dt>
				<dd class="text-uv-text-main">
					theme beats {Math.round(ex.pct * 100)}% of matched controls{#if ex.judge !== null}; judge {ex.judge
							? 'picked it'
							: 'missed it'}{/if}
				</dd>
			</div>
		</dl>
	</div>
</div>

<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';
	import LanyardPresence from '$lib/components/LanyardPresence.svelte';
	let { data }: { data: PageData } = $props();
</script>

<div
	class="fixed top-1/2 left-1/2 z-10 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 px-6 md:px-12"
>
	<div class="w-full">
		<section id="about" class="fade-in mb-6">
			<div class="flex flex-col gap-3">
				<h1 class="text-3xl font-bold tracking-tight text-uv-text-main md:text-4xl">swappy</h1>

				<p class="text-sm font-medium tracking-wide text-uv-text-dim">
					engineering @ <a
						href="https://atlan.com"
						target="_blank"
						rel="external noopener noreferrer"
						class="text-uv-link underline decoration-uv-link/40 underline-offset-4 transition-colors hover:text-uv-link-hover hover:decoration-uv-link-hover"
						>atlan</a
					>
				</p>

				<p class="text-sm leading-relaxed text-uv-text-body">
					currently working on agentic systems, evals, durable workflows and tooling
				</p>

				<p class="text-sm leading-relaxed text-uv-text-body">
					also interested in post training models, rl envs, inference, kernels and all things
					related
				</p>

				<p class="text-sm leading-relaxed text-uv-text-body">
					I've written a longer introduction <a
						href={resolve('/about')}
						class="font-medium text-uv-link underline decoration-uv-link underline-offset-4 transition-colors hover:text-uv-link-hover hover:decoration-uv-link-hover"
						>here</a
					>
					:)
				</p>
				<p class="mt-12 text-sm leading-relaxed text-uv-text-body">
					this website is for a collection of incomplete notes, thoughts and tools
				</p>
				<p class="mt-6">
					<span
						class="cursor-pointer text-sm font-medium text-uv-highlight italic transition-colors hover:text-ctp-lavender"
						>for those who come after</span
					>
				</p>
			</div>
		</section>

		<LanyardPresence initialPresence={data.lanyard} />
	</div>
</div>

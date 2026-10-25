<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';
	import LanyardPresence from '$lib/components/LanyardPresence.svelte';
	let { data }: { data: PageData } = $props();
</script>

<div class="fixed top-1/2 left-1/2 z-10 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 px-6 md:px-12">
	<div class="w-full">
		<section id="about" class="fade-in mb-6">
			<div class="flex flex-col gap-3">
				<h1 class="text-3xl font-bold tracking-tight text-white md:text-4xl">swappy</h1>

				<p class="text-sm font-medium tracking-wide text-uv-text-dim">
					engineering @ <a
						href="https://atlan.com"
						target="_blank"
						rel="external noopener noreferrer"
						class="underline decoration-violet-400/70 underline-offset-4 transition-colors hover:text-violet-300"
						>atlan</a
					>
				</p>

				<p class="text-sm leading-relaxed text-uv-text-dim">
					currently working on agentic systems, evals, durable workflows and tooling
				</p>

				<p class="text-sm leading-relaxed text-uv-text-dim">
					also interested in post training models, rl envs, inference, kernels and all things related
				</p>

				<p class="text-sm leading-relaxed text-uv-text-dim">
					I've written a longer introduction <a
						href={resolve('/about')}
						class="font-medium text-white underline decoration-violet-300 underline-offset-4 transition-colors hover:text-violet-200"
						>here</a
					>
					:)
				</p>
				<p class="mt-12">
					<span
						class="cursor-pointer text-sm font-medium text-violet-400 italic transition-colors hover:text-violet-300"
						>for those who come after</span
					>
				</p>
			</div>
		</section>

		<LanyardPresence initialPresence={data.lanyard} />
	</div>
</div>

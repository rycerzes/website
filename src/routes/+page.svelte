<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';
	import LanyardPresence from '$lib/components/LanyardPresence.svelte';
	let { data }: { data: PageData } = $props();
</script>

<section id="about" class="fade-in mb-6 max-w-2xl">
	<div class="flex flex-col items-start gap-8 md:flex-row">
		<div class="relative shrink-0">
			<!-- Profile Image with CRT scanline effect overlay -->
			<div
				class="border-theme/50 group crt-effect relative h-32 w-32 overflow-hidden rounded-none border md:h-40 md:w-40"
			>
				<img
					src={data.avatarUrl}
					alt="Profile"
					class="h-full w-full object-cover transition-all duration-500"
				/>
				<div class="pointer-events-none absolute inset-0 bg-violet-900/10 mix-blend-overlay"></div>
			</div>
		</div>

		<div class="flex flex-col gap-3">
			<h1 class="text-3xl font-bold tracking-tight text-white md:text-4xl">swappy</h1>

			<div class="text-sm font-medium tracking-wide text-uv-text-dim">
				<p>eng intern @ atlan</p>
				<p>programmer. tinkerer. nerd.</p>
			</div>

			<p class="mt-1 max-w-lg text-sm leading-relaxed text-uv-text-dim">
				currently interning at atlan, working on agentic systems
			</p>

			<p class="mt-2 text-sm text-uv-text-dim">
				I've written a longer introduction <a
					href={resolve('/about')}
					class="underline transition-colors hover:text-violet-400">here</a
				> if you're interested :)
			</p>
			<div class="mt-2 text-sm">
				<span class="text-uv-text-dim/80">e33: </span>
				<span
					class="cursor-pointer font-medium text-violet-400 italic transition-colors hover:text-violet-300"
					>for those who come after</span
				>
			</div>
		</div>
	</div>
</section>

<LanyardPresence initialPresence={data.lanyard} />

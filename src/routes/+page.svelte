<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';
	import LanyardPresence from '$lib/components/LanyardPresence.svelte';
	import { getFeaturedProjects } from '$lib/projects';

	const projects = getFeaturedProjects();
	let { data }: { data: PageData } = $props();
</script>

<div class="w-full py-8">
	<div class="flex w-full flex-col gap-12">
		<section id="about" class="fade-in">
			<div class="flex flex-col gap-3">
				<h1 class="text-2xl leading-8 font-semibold tracking-tight text-uv-text-main">swappy</h1>

				<p class="text-sm leading-5 text-uv-text-dim">
					engineering @ <a
						href="https://atlan.com"
						target="_blank"
						rel="external noopener noreferrer"
						class="text-uv-link underline decoration-uv-link/40 underline-offset-4 transition-colors hover:text-uv-link-hover hover:decoration-uv-link-hover"
						>atlan</a
					>
				</p>

				<p class="text-sm leading-6 text-uv-text-body">
					currently working on agentic systems, evals, durable workflows and tooling
				</p>

				<p class="text-sm leading-6 text-uv-text-body">
					also interested in post training models, rl envs, inference, kernels and all things
					related
				</p>

				<p class="text-sm leading-6 text-uv-text-body">
					I've written a longer introduction <a
						href={resolve('/about')}
						class="font-medium text-uv-link underline decoration-uv-link underline-offset-4 transition-colors hover:text-uv-link-hover hover:decoration-uv-link-hover"
						>here</a
					>
					:)
				</p>
				<p class="text-sm leading-6 text-uv-text-body">
					this website is for a collection of incomplete notes, thoughts and tools
				</p>
				<p>
					<span
						class="cursor-pointer text-sm leading-6 text-uv-highlight italic transition-colors hover:text-ctp-lavender"
						>for those who come after</span
					>
				</p>
			</div>
		</section>

		<section id="projects" class="fade-in">
			<h3 class="mb-1 text-base leading-6 font-semibold tracking-tight text-uv-text-main">
				featured projects
			</h3>
			<div class="flex flex-col">
				{#each projects as project (project.slug)}
					<a
						href={resolve('/projects/[slug]', { slug: project.slug })}
						class="group -mx-3 flex items-center px-3 py-3 transition-colors hover:bg-uv-mute/20"
					>
						<div class="min-w-0 flex-1">
							<p
								class="truncate text-sm font-medium text-uv-text-main transition-colors group-hover:text-uv-highlight"
							>
								{project.title}
							</p>
							<p class="mt-0.5 truncate text-xs text-uv-text-dim">{project.description}</p>
						</div>
						<div
							class="ml-4 flex shrink-0 items-center gap-3 text-xs text-uv-text-dim tabular-nums"
						>
							{#if project.tag}<span class="bg-uv-tag/10 px-1.5 text-uv-tag">{project.tag}</span
								>{/if}
							<span class="hidden sm:inline">{project.year}</span>
						</div>
					</a>
				{/each}
			</div>
			<a
				href={resolve('/projects')}
				class="mt-3 inline-block text-xs text-uv-text-dim transition-colors hover:text-uv-highlight"
				>all projects →</a
			>
		</section>

		<LanyardPresence initialPresence={data.lanyard} />
	</div>
</div>

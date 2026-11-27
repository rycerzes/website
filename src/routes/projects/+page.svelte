<script lang="ts">
	import { resolve } from '$app/paths';

	let { data } = $props();
</script>

<div class="w-full py-8">
	<a href={resolve('/')} class="text-xs text-uv-text-dim transition-colors hover:text-uv-highlight">
		← home
	</a>

	<header class="mt-6 mb-8">
		<h1 class="text-2xl font-semibold tracking-tight text-uv-text-main">projects</h1>
		<p class="mt-1 text-sm text-uv-text-dim">selected experiments and things i've built</p>
	</header>

	<div class="flex flex-col">
		{#each data.projects as project (project.slug)}
			<a
				href={resolve('/projects/[slug]', { slug: project.slug })}
				class="group flex items-center justify-between border-l-2 border-transparent py-3 pl-3 transition-colors hover:border-uv-highlight"
			>
				<div class="min-w-0 flex-1">
					<p
						class="text-sm font-medium text-uv-text-main transition-colors group-hover:text-uv-highlight"
					>
						{project.title}
					</p>
					<p class="mt-0.5 truncate text-xs text-uv-text-dim">{project.description}</p>
				</div>
				<div class="ml-4 flex shrink-0 items-center gap-3 text-xs text-uv-text-dim tabular-nums">
					{#if project.tag}<span class="bg-uv-tag/10 px-1.5 text-uv-tag">{project.tag}</span>{/if}
					<span>{project.year}</span>
				</div>
			</a>
		{/each}
	</div>
</div>

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

	<div class="flex flex-col divide-y divide-uv-mute/40">
		{#each data.projects as project (project.slug)}
			<a
				href={resolve('/projects/[slug]', { slug: project.slug })}
				class="group grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-6 gap-y-1 py-4"
			>
				<h2
					class="min-w-0 text-sm leading-5 font-medium text-uv-text-main transition-colors group-hover:text-uv-highlight"
				>
					{project.title}
				</h2>
				<div class="flex items-center gap-3 pt-0.5 text-xs text-uv-text-dim tabular-nums">
					{#if project.tag}<span class="bg-uv-tag/10 px-1.5 text-uv-tag">{project.tag}</span>{/if}
					<span>{project.year}</span>
				</div>
				<p
					class="min-w-0 text-xs leading-4 text-uv-text-dim transition-colors group-hover:text-uv-text-main/80"
				>
					{project.description}
				</p>
			</a>
		{/each}
	</div>
</div>

<script lang="ts">
	import { resolve } from '$app/paths';
	import MdxContent from '$lib/components/MdxContent.svelte';
	import { isExternal } from '$lib/projects';

	let { data } = $props();
	let project = $derived(data.project);
</script>

<div class="w-full py-8">
	<a
		href={resolve('/projects')}
		class="text-xs text-uv-text-dim transition-colors hover:text-uv-highlight"
	>
		← projects
	</a>

	<hr class="my-6 border-uv-mute" />

	<h1 class="text-2xl font-semibold tracking-tight text-uv-text-main">{project.title}</h1>
	<p class="mt-2 text-sm text-uv-text-dim">{project.description}</p>

	<hr class="my-6 border-uv-mute" />

	<div class="flex flex-wrap gap-x-16 gap-y-6">
		{#if project.links.length > 0}
			<div>
				<p class="text-xs tracking-widest text-uv-text-dim uppercase">links</p>
				<div class="mt-2 flex flex-wrap gap-x-4 gap-y-1">
					{#each project.links as link (link.href)}
						{#if isExternal(link.href)}
							<a
								href={link.href}
								target="_blank"
								rel="external noopener noreferrer"
								class="text-sm text-uv-link transition-colors hover:text-uv-link-hover"
								>{link.label}</a
							>
						{:else}
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- internal path from frontmatter -->
							<a
								href={link.href}
								class="text-sm text-uv-link transition-colors hover:text-uv-link-hover"
								>{link.label}</a
							>
						{/if}
					{/each}
				</div>
			</div>
		{/if}
		<div>
			<p class="text-xs tracking-widest text-uv-text-dim uppercase">date</p>
			<p class="mt-2 text-sm text-uv-text-body">{project.year}</p>
		</div>
	</div>

	{#if project.hasBody && project.component}
		<div
			class="mdx-content prose mt-8 max-w-none prose-invert
				prose-headings:tracking-tight prose-headings:text-uv-text-main
				prose-p:text-uv-text-body
				prose-a:text-uv-link prose-a:underline prose-a:decoration-uv-link/30 prose-a:underline-offset-2
				prose-strong:font-medium prose-strong:text-uv-text-main
				prose-code:bg-uv-mute/30 prose-code:px-1 prose-code:py-0.5 prose-code:font-mono prose-code:text-[1em] prose-code:font-normal prose-code:text-ctp-green prose-code:before:content-none prose-code:after:content-none
				prose-li:text-uv-text-body [&_a:hover]:text-uv-link-hover"
		>
			<MdxContent Component={project.component} />
		</div>
	{/if}
</div>

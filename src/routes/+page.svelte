<script lang="ts">
	import type { PageData } from './$types';
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
				<p>eng intern @ siemens</p>
				<p>programmer. tinkerer. nerd.</p>
			</div>

			<p class="mt-1 max-w-lg text-sm leading-relaxed text-uv-text-dim">
				currently interning at siemens, working on vlms/llms, robotics and autonomous systems.
			</p>

			<p class="mt-2 text-sm text-uv-text-dim">
				I've written a longer introduction <a
					href="/about"
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

<section id="projects">
	<div class="mb-6 flex items-end justify-between border-b border-theme pb-2">
		<h2 class="text-xs font-bold tracking-[0.2em] text-violet-200">Projects</h2>
		<span class="font-mono text-[10px] tracking-widest text-uv-text-dim"
			>[01-{String(data.projects?.length || 0).padStart(2, '0')}]</span
		>
	</div>
	<div class="flex flex-col gap-3">
		{#if data.projects && data.projects.length > 0}
			{#each data.projects as project, i}
				<a
					class="group border-theme/80 relative flex flex-col justify-between gap-4 overflow-hidden rounded-none border bg-uv-deep/50 px-4 py-4 transition-all duration-500 hover:bg-uv-mute/40 md:flex-row md:items-center md:px-6"
					href={project.html_url}
					target="_blank"
					rel="noopener noreferrer"
				>
					<div
						class="absolute inset-y-0 left-0 w-1 bg-violet-600 transition-colors duration-500 group-hover:bg-violet-400"
					></div>
					<div class="flex flex-col gap-1 md:w-2/5">
						<span class="mb-0.5 text-[9px] font-bold text-violet-400"
							>[{String(i + 1).padStart(2, '0')}]</span
						>
						<h3
							class="text-base font-medium text-white transition-colors group-hover:text-violet-200"
						>
							{project.full_name}
						</h3>
						<div class="mt-1 flex flex-wrap gap-1.5">
							{#each project.languages.slice(0, 3) as lang}
								<span class="rounded bg-violet-900/30 px-1.5 py-0.5 text-[9px] text-violet-300"
									>{lang}</span
								>
							{/each}
						</div>
					</div>
					<div class="flex flex-col gap-1.5 md:w-2/5">
						<p
							class="line-clamp-2 text-xs leading-relaxed text-uv-text-dim transition-colors group-hover:text-uv-text-main"
						>
							{project.description || 'No description available.'}
						</p>
						<p class="mt-auto font-mono text-[9px] text-uv-text-dim">
							Last update: {new Date(project.pushed_at).toLocaleDateString()}
						</p>
					</div>
					<div class="flex justify-end md:w-1/5">
						<span
							class="material-symbols-outlined text-sm text-uv-text-dim transition-all duration-300 group-hover:translate-x-1 group-hover:text-violet-400"
							>arrow_right_alt</span
						>
					</div>
				</a>
			{/each}
		{:else}
			<p class="text-xs text-uv-text-dim">No projects found.</p>
		{/if}
	</div>
	<div class="mt-4 flex justify-end px-4 md:px-6">
		<a
			href="https://github.com/rycerzes"
			target="_blank"
			rel="noopener noreferrer"
			class="group flex items-center gap-2 text-xs font-medium text-uv-text-dim transition-colors hover:text-violet-400"
		>
			more projects
			<span class="transition-transform duration-300 group-hover:translate-x-1">-&gt;</span>
		</a>
	</div>
</section>

<section id="Blog">
	<div class="mb-6 flex items-end justify-between border-b border-theme pb-2">
		<h2 class="text-xs font-bold tracking-[0.2em] text-violet-200">Blog</h2>
		<span class="font-mono text-[10px] tracking-widest text-uv-text-dim"
			>[01-{String(data.posts?.length || 0).padStart(2, '0')}]</span
		>
	</div>
	<div class="bg-theme/30 space-y-px">
		{#if data.posts && data.posts.length > 0}
			{#each data.posts as post}
				<a
					class="group flex items-center justify-between rounded-sm px-4 py-3 transition-all duration-300 hover:bg-uv-mute/20 md:px-4"
					href="/blog/{post.slug}"
				>
					<div class="flex w-full flex-col gap-2 md:flex-row md:items-center md:gap-8">
						<span class="w-24 font-mono text-[10px] tracking-wider text-violet-400"
							>{post.date}</span
						>
						<span
							class="text-sm font-medium tracking-wide text-uv-text-dim transition-colors duration-300 group-hover:text-violet-100"
							>{post.title}</span
						>
					</div>
					<span
						class="material-symbols-outlined text-xs text-violet-900 transition-all duration-300 group-hover:text-violet-400"
						>terminal</span
					>
				</a>
			{/each}
		{:else}
			<div class="px-4 py-3 text-xs text-uv-text-dim">No posts found.</div>
		{/if}
	</div>
</section>

<section id="activity">
	<div class="mb-6 flex items-end justify-between border-b border-theme pb-2">
		<h2 class="text-xs font-bold tracking-[0.2em] text-violet-200">Recent Activity</h2>
		<span class="font-mono text-[10px] tracking-widest text-uv-text-dim">SPOTIFY</span>
	</div>
	<div class="bg-theme/30 space-y-px">
		{#if data.recentActivity}
			<a
				class="group flex items-center justify-between rounded-sm px-4 py-3 transition-all duration-300 hover:bg-uv-mute/20 md:px-4"
				href={data.recentActivity.url}
				target="_blank"
				rel="noopener noreferrer"
			>
				<div class="flex w-full flex-col gap-2 md:flex-row md:items-center md:gap-8">
					<span class="w-24 font-mono text-[10px] tracking-wider text-green-400">Last Played</span>
					<span
						class="text-sm font-medium tracking-wide text-uv-text-dim transition-colors duration-300 group-hover:text-violet-100"
						>{data.recentActivity.title} - {data.recentActivity.artist}</span
					>
				</div>
				<span
					class="material-symbols-outlined text-sm text-violet-900 transition-all duration-300 group-hover:text-violet-400"
					>graphic_eq</span
				>
			</a>
		{:else}
			<div class="px-4 py-3 text-xs text-uv-text-dim">No recent activity found.</div>
		{/if}
	</div>
</section>

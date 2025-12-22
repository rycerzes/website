<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<section id="about" class="max-w-2xl mb-6 fade-in">
	<div class="flex flex-col md:flex-row gap-8 items-start">
		<div class="relative shrink-0">
			<!-- Profile Image with CRT scanline effect overlay -->
			<!-- Profile Image with CRT scanline effect overlay -->
			<div
				class="w-32 h-32 md:w-40 md:h-40 rounded-none overflow-hidden border border-theme/50 relative group crt-effect"
			>
				<img
					src={data.avatarUrl}
					alt="Profile"
					class="w-full h-full object-cover transition-all duration-500"
				/>
				<div class="absolute inset-0 bg-violet-900/10 pointer-events-none mix-blend-overlay"></div>
			</div>
		</div>

		<div class="flex flex-col gap-3">
			<h1 class="text-3xl md:text-4xl font-bold tracking-tight text-white italic">Lorem Ipsum</h1>

			<div class="text-sm text-uv-text-dim font-medium tracking-wide">
				<p>Lorem ipsum</p>
				<p>Dolor sit amet</p>
			</div>

			<p class="text-sm text-uv-text-dim leading-relaxed max-w-lg mt-1">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
				labore et dolore magna aliqua.
			</p>

			<div class="mt-2 text-sm">
				<span class="text-uv-text-dim/80">lorem ipsum: </span>
				<span
					class="text-violet-400 italic font-medium hover:text-violet-300 transition-colors cursor-pointer"
					>Lorem ipsum dolor sit amet</span
				>
			</div>
		</div>
	</div>
</section>

<section id="projects">
	<div class="flex items-end justify-between border-b border-theme pb-2 mb-6">
		<h2 class="text-xs font-bold text-violet-200 uppercase tracking-[0.2em]">Projects</h2>
		<span class="text-[10px] text-uv-text-dim font-mono tracking-widest"
			>[01-{String(data.projects?.length || 0).padStart(2, '0')}]</span
		>
	</div>
	<div class="flex flex-col gap-3">
		{#if data.projects && data.projects.length > 0}
			{#each data.projects as project, i}
				<a
					class="group relative py-4 border border-theme/80 bg-uv-deep/50 hover:bg-uv-mute/40 transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 md:px-6 rounded-sm overflow-hidden"
					href={project.html_url}
					target="_blank"
					rel="noopener noreferrer"
				>
					<div
						class="absolute inset-y-0 left-0 w-1 bg-violet-600 group-hover:bg-violet-400 transition-colors duration-500"
					></div>
					<div class="flex flex-col gap-1 md:w-2/5">
						<span class="text-[9px] text-violet-400 font-bold mb-0.5"
							>[{String(i + 1).padStart(2, '0')}]</span
						>
						<h3
							class="text-base text-white font-medium group-hover:text-violet-200 transition-colors"
						>
							{project.full_name}
						</h3>
						<div class="flex flex-wrap gap-1.5 mt-1">
							{#each project.languages.slice(0, 3) as lang}
								<span class="text-[9px] px-1.5 py-0.5 bg-violet-900/30 text-violet-300 rounded"
									>{lang}</span
								>
							{/each}
						</div>
					</div>
					<div class="md:w-2/5 flex flex-col gap-1.5">
						<p
							class="text-xs text-uv-text-dim leading-relaxed group-hover:text-uv-text-main transition-colors line-clamp-2"
						>
							{project.description || 'No description available.'}
						</p>
						<p class="text-[9px] text-uv-text-dim font-mono mt-auto">
							Last update: {new Date(project.pushed_at).toLocaleDateString()}
						</p>
					</div>
					<div class="md:w-1/5 flex justify-end">
						<span
							class="material-symbols-outlined text-sm text-uv-text-dim group-hover:text-violet-400 group-hover:translate-x-1 transition-all duration-300"
							>arrow_right_alt</span
						>
					</div>
				</a>
			{/each}
		{:else}
			<p class="text-xs text-uv-text-dim">No projects found.</p>
		{/if}
	</div>
</section>

<section id="writing">
	<div class="flex items-end justify-between border-b border-theme pb-2 mb-6">
		<h2 class="text-xs font-bold text-violet-200 uppercase tracking-[0.2em]">Writing</h2>
		<span class="text-[10px] text-uv-text-dim font-mono tracking-widest"
			>[01-{String(data.posts?.length || 0).padStart(2, '0')}]</span
		>
	</div>
	<div class="space-y-px bg-theme/30">
		{#if data.posts && data.posts.length > 0}
			{#each data.posts as post}
				<a
					class="group flex items-center justify-between py-3 px-4 md:px-4 hover:bg-uv-mute/10 transition-all duration-300"
					href="/blog/{post.slug}"
				>
					<div class="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 w-full">
						<span class="text-[10px] text-violet-400 font-mono w-24 tracking-wider"
							>{post.date}</span
						>
						<span
							class="text-sm text-uv-text-dim font-medium uppercase tracking-wide group-hover:text-violet-100 transition-colors group-hover:pl-2 duration-300"
							>{post.title}</span
						>
					</div>
					<span
						class="material-symbols-outlined text-xs text-violet-900 group-hover:text-violet-400 transition-all duration-300"
						>terminal</span
					>
				</a>
			{/each}
		{:else}
			<div class="py-3 px-4 text-xs text-uv-text-dim">No posts found.</div>
		{/if}
	</div>
</section>

<section id="resources">
	<div class="flex items-end justify-between border-b border-theme pb-2 mb-6">
		<h2 class="text-xs font-bold text-violet-200 uppercase tracking-[0.2em]">Lorem Ipsum</h2>
		<span class="text-[10px] text-uv-text-dim font-mono tracking-widest">IPSUM</span>
	</div>
	<div class="space-y-px bg-theme/30">
		<a
			class="group flex items-center justify-between py-3 px-4 md:px-4 hover:bg-uv-mute/10 transition-all duration-300"
			href="/"
		>
			<div class="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 w-full">
				<span
					class="text-sm text-uv-text-dim font-medium uppercase tracking-wide group-hover:text-violet-100 transition-colors group-hover:pl-2 duration-300"
					>Lorem Ipsum</span
				>
			</div>
			<span
				class="material-symbols-outlined text-sm text-violet-900 group-hover:text-violet-400 transition-all duration-300"
				>arrow_outward</span
			>
		</a>
		<a
			class="group flex items-center justify-between py-3 px-4 md:px-4 hover:bg-uv-mute/10 transition-all duration-300"
			href="/"
		>
			<div class="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 w-full">
				<span
					class="text-sm text-uv-text-dim font-medium uppercase tracking-wide group-hover:text-violet-100 transition-colors group-hover:pl-2 duration-300"
					>Dolor Sit Amet</span
				>
			</div>
			<span
				class="material-symbols-outlined text-sm text-violet-900 group-hover:text-violet-400 transition-all duration-300"
				>arrow_outward</span
			>
		</a>
	</div>
</section>

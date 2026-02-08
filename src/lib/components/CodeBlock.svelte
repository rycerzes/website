<script lang="ts">
	import { Check, Copy } from '@lucide/svelte';

	let { children, ...props }: { children?: any; [key: string]: any } = $props();

	let copied = $state(false);
	let preElement: HTMLPreElement | null = $state(null);

	async function copyCode() {
		try {
			// Extract text content from the pre element
			const code = preElement?.textContent || '';
			await navigator.clipboard.writeText(code.trim());
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	}
</script>

<div class="group relative not-prose my-4">
	<button
		onclick={copyCode}
		class="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-md border border-uv-mute/50 bg-uv-deep/80 px-2.5 py-1.5 font-mono text-xs text-uv-text-dim opacity-0 shadow-sm backdrop-blur-sm transition-all hover:border-violet-500/50 hover:bg-uv-deep hover:text-violet-300 group-hover:opacity-100"
		aria-label="Copy code"
	>
		{#if copied}
			<Check size={14} />
			<span>Copied!</span>
		{:else}
			<Copy size={14} />
			<span>Copy</span>
		{/if}
	</button>
	<pre bind:this={preElement} class="overflow-x-auto rounded-lg border border-uv-mute/30 bg-uv-deep/50 p-4 text-sm leading-relaxed" {...props}>{@render children?.()}</pre>
</div>

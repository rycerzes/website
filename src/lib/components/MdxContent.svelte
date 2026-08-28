<script lang="ts">
	import type { Component as SvelteComponent } from 'svelte';
	import mermaid from 'mermaid';
	import { surface, border, text, accent } from '$lib/palette';

	const mermaidThemeVariables = {
		darkMode: true,
		background: 'transparent',
		fontFamily: 'JetBrains Mono, monospace',
		fontSize: '14px',
		primaryColor: surface.deep,
		primaryTextColor: text.primary,
		primaryBorderColor: border.subtle,
		secondaryColor: surface.raised,
		secondaryTextColor: text.primary,
		secondaryBorderColor: border.default,
		tertiaryColor: surface.overlay,
		tertiaryTextColor: text.primary,
		tertiaryBorderColor: border.strong,
		lineColor: accent,
		textColor: text.body,
		mainBkg: surface.deep,
		nodeBorder: border.strong,
		nodeTextColor: text.primary,
		clusterBkg: surface.raised,
		clusterBorder: border.default,
		edgeLabelBackground: surface.raised,
		titleColor: text.primary,
		actorBkg: surface.deep,
		actorBorder: border.strong,
		actorTextColor: text.primary,
		actorLineColor: accent,
		signalColor: text.dim,
		signalTextColor: text.primary,
		labelBoxBkgColor: surface.raised,
		labelBoxBorderColor: border.strong,
		labelTextColor: text.primary,
		activationBkgColor: surface.overlay,
		activationBorderColor: border.strong,
		noteBkgColor: surface.overlay,
		noteTextColor: text.primary,
		noteBorderColor: border.strong,
		errorBkgColor: surface.error,
		errorTextColor: text.primary
	} as const;

	let { Component } = $props<{ Component?: SvelteComponent }>();
	let contentElement: HTMLDivElement;
	let mermaidReady = false;

	function ensureMermaidInitialized() {
		if (mermaidReady) return;

		mermaid.initialize({
			startOnLoad: false,
			theme: 'base',
			themeVariables: {
				...mermaidThemeVariables,
				background: 'transparent'
			},
			securityLevel: 'loose'
		});

		mermaidReady = true;
	}

	$effect(() => {
		void Component;

		if (!contentElement) return;

		ensureMermaidInitialized();

		const mermaidBlocks = Array.from(
			contentElement.querySelectorAll<HTMLPreElement>('pre.mermaid')
		);
		if (mermaidBlocks.length > 0) {
			void mermaid.run({ nodes: mermaidBlocks }).catch((error) => {
				console.error('Failed to render Mermaid diagram(s):', error);
			});

			// Mermaid injects inline SVG styles; force transparent canvas for all diagrams.
			const mermaidSvgs = contentElement.querySelectorAll<SVGElement>('pre.mermaid svg');
			mermaidSvgs.forEach((svg) => {
				svg.style.backgroundColor = 'transparent';
			});
		}

		// Add copy buttons to all pre elements
		const preElements = contentElement.querySelectorAll('pre:not(.mermaid)');
		preElements.forEach((pre) => {
			// Skip if already has a copy button
			if (pre.parentElement?.classList.contains('code-block-wrapper')) return;

			// Create wrapper
			const wrapper = document.createElement('div');
			wrapper.className = 'code-block-wrapper group relative not-prose my-4';

			// Create copy button
			const button = document.createElement('button');
			button.className =
				'copy-button absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-md border border-uv-mute/50 bg-uv-deep/80 px-2.5 py-1.5 font-mono text-xs text-uv-text-dim opacity-0 shadow-sm backdrop-blur-sm transition-all hover:border-violet-500/50 hover:bg-uv-deep hover:text-violet-300 group-hover:opacity-100';
			button.setAttribute('aria-label', 'Copy code');
			button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg><span>Copy</span>`;

			button.onclick = async () => {
				try {
					const code = pre.textContent || '';
					await navigator.clipboard.writeText(code.trim());

					// Update button to show success
					button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>Copied!</span>`;

					setTimeout(() => {
						button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg><span>Copy</span>`;
					}, 2000);
				} catch (err) {
					console.error('Failed to copy:', err);
				}
			};

			// Remove prose styles from pre
			pre.classList.add(
				'overflow-x-auto',
				'rounded-lg',
				'border',
				'border-uv-mute/30',
				'bg-uv-deep/50',
				'p-4',
				'!my-0'
			);

			// Wrap the pre element
			pre.parentNode?.insertBefore(wrapper, pre);
			wrapper.appendChild(button);
			wrapper.appendChild(pre);
		});

		// Add wrapper to all table elements for responsiveness
		const tables = contentElement.querySelectorAll('table');
		tables.forEach((table) => {
			// Skip if already wrapped
			if (table.parentElement?.classList.contains('table-wrapper')) return;

			const wrapper = document.createElement('div');
			wrapper.className =
				'table-wrapper overflow-x-auto my-8 rounded-lg border border-uv-mute/30 bg-uv-deep/30';

			table.parentNode?.insertBefore(wrapper, table);
			wrapper.appendChild(table);
		});
	});
</script>

<div bind:this={contentElement}>
	{#if Component}
		<Component />
	{/if}
</div>

<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	type Props = {
		text: string;
		maxLines?: number;
		class?: string;
	};

	let { text, maxLines = 3, class: className = '' }: Props = $props();

	type PretextModule = typeof import('@chenglou/pretext');

	let root = $state<HTMLElement | null>(null);
	let renderedText = $state('');
	let hasOverflow = $state(false);
	let pretextModule = $state<PretextModule | null>(null);

	function resolveLineHeight(style: CSSStyleDeclaration): number {
		const fontSize = Number.parseFloat(style.fontSize) || 16;
		const parsed = Number.parseFloat(style.lineHeight);
		if (Number.isFinite(parsed)) return parsed;

		// CSS "normal" typically lands around 1.2 in browsers.
		return fontSize * 1.2;
	}

	function buildCandidate(firstLines: string[], lastLine: string): string {
		const head = firstLines.join('');
		return `${head}${lastLine.trimEnd()}...`;
	}

	async function recomputeExcerpt(): Promise<void> {
		if (!browser || !root) return;

		renderedText = text;
		hasOverflow = false;

		if (!pretextModule) {
			try {
				pretextModule = await import('@chenglou/pretext');
			} catch {
				return;
			}
		}

		const width = root.clientWidth;
		if (width <= 0) return;

		const styles = getComputedStyle(root);
		const lineHeight = resolveLineHeight(styles);
		const font = styles.font;
		if (!font) return;

		const prepared = pretextModule.prepareWithSegments(text, font, { whiteSpace: 'normal' });
		const { lineCount, lines } = pretextModule.layoutWithLines(prepared, width, lineHeight);

		if (lineCount <= maxLines) {
			renderedText = text;
			hasOverflow = false;
			return;
		}

		hasOverflow = true;

		const visible = lines.slice(0, maxLines).map((line) => line.text);
		const leadingLines = visible.slice(0, -1);
		let trailingLine = visible.at(-1)?.trimEnd() ?? '';
		let candidate = buildCandidate(leadingLines, trailingLine);

		while (trailingLine.length > 0) {
			const measured = pretextModule.layout(
				pretextModule.prepare(candidate, font),
				width,
				lineHeight
			);
			if (measured.lineCount <= maxLines) break;

			trailingLine = trailingLine.slice(0, -1).trimEnd();
			candidate = buildCandidate(leadingLines, trailingLine);
		}

		renderedText = candidate;
	}

	$effect(() => {
		text;
		maxLines;
		void recomputeExcerpt();
	});

	onMount(() => {
		if (!root) return;

		const observer = new ResizeObserver(() => {
			void recomputeExcerpt();
		});

		observer.observe(root);

		return () => {
			observer.disconnect();
		};
	});
</script>

<p bind:this={root} class={className} data-pretext-overflow={hasOverflow}>
	{renderedText || text}
</p>

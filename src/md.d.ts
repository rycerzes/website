declare module '*.mdx' {
	import type { Component } from 'svelte';
	export const metadata: Record<string, unknown> | undefined;
	const component: Component;
	export default component;
}

declare module '*.md' {
	import type { Component } from 'svelte';
	const component: Component;
	export default component;
}

declare module '*.svx' {
	import type { Component } from 'svelte';
	const component: Component;
	export default component;
}

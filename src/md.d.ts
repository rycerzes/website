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

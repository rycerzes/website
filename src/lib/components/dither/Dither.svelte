<script lang="ts">
	import { Canvas } from '@threlte/core';
	import Scene from './Scene.svelte';

	let props = $props();
</script>

<div class="dither-container">
	<Canvas renderMode="manual">
		<Scene {...props} />
	</Canvas>
</div>

<style>
	.dither-container {
		width: 100%;
		height: 100%;
		position: relative;
		pointer-events: auto; /* Ensure pointer events work */
	}
</style>

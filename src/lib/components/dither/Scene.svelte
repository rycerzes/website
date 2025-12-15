<!-- Ported over to svelte from
https://github.com/DavidHDev/react-bits/blob/main/src/demo/Backgrounds/DitherDemo.jsx -->

<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import { Vector2, Color, Uniform, Clock } from 'three';
	import { EffectComposer, EffectPass, RenderPass } from 'postprocessing';
	import { waveVertexShader, waveFragmentShader } from './shaders';
	import { RetroEffect } from './RetroEffect';

	interface Props {
		waveSpeed?: number;
		waveFrequency?: number;
		waveAmplitude?: number;
		waveColor?: number[];
		colorNum?: number;
		pixelSize?: number;
		disableAnimation?: boolean;
		enableMouseInteraction?: boolean;
		mouseRadius?: number;
	}

	let {
		waveSpeed = 0.05,
		waveFrequency = 3,
		waveAmplitude = 0.3,
		waveColor = [0.5, 0.5, 0.5],
		colorNum = 4,
		pixelSize = 2,
		disableAnimation = false,
		enableMouseInteraction = true,
		mouseRadius = 1
	}: Props = $props();

	const { renderer, scene, camera, size } = useThrelte();

	// Uniforms
	const uniforms = {
		time: new Uniform(0),
		resolution: new Uniform(new Vector2(0, 0)),
		waveSpeed: new Uniform(waveSpeed),
		waveFrequency: new Uniform(waveFrequency),
		waveAmplitude: new Uniform(waveAmplitude),
		waveColor: new Uniform(new Color(...(waveColor as [number, number, number]))),
		mousePos: new Uniform(new Vector2(0, 0)),
		enableMouseInteraction: new Uniform(enableMouseInteraction ? 1 : 0),
		mouseRadius: new Uniform(mouseRadius)
	};

	let composer: EffectComposer | undefined;
	let retroEffect: RetroEffect | undefined;

	// Initialize Composer
	$effect(() => {
		if (!renderer || !scene || !$camera) return;

		const comp = new EffectComposer(renderer);
		comp.addPass(new RenderPass(scene, $camera));

		const effect = new RetroEffect({ colorNum, pixelSize });
		comp.addPass(new EffectPass($camera, effect));

		composer = comp;
		retroEffect = effect;

		return () => {
			comp.dispose();
		};
	});

	// Update RetroEffect props
	$effect(() => {
		if (retroEffect) {
			retroEffect.colorNum = colorNum;
			retroEffect.pixelSize = pixelSize;
		}
	});

	// Update Uniforms
	$effect(() => {
		uniforms.waveSpeed.value = waveSpeed;
		uniforms.waveFrequency.value = waveFrequency;
		uniforms.waveAmplitude.value = waveAmplitude;
		uniforms.waveColor.value.set(...(waveColor as [number, number, number]));
		uniforms.enableMouseInteraction.value = enableMouseInteraction ? 1 : 0;
		uniforms.mouseRadius.value = mouseRadius;
	});

	// Resize
	$effect(() => {
		const dpr = renderer.getPixelRatio();
		const w = $size.width;
		const h = $size.height;
		uniforms.resolution.value.set(Math.floor(w * dpr), Math.floor(h * dpr));
		composer?.setSize(w, h);
	});

	let mouse = new Vector2(0, 0);
	const clock = new Clock();

	// Render Loop
	useTask((delta) => {
		if (!disableAnimation) {
			// Use absolute time so that multiple instances (header + background) are synced
			uniforms.time.value = (performance.now() / 1000) % 10000;
		}

		if (enableMouseInteraction) {
			uniforms.mousePos.value.copy(mouse);
		}

		// RENDER
		composer?.render();
	});
</script>

<T.PerspectiveCamera makeDefault position={[0, 0, 6]} />

<T.Mesh scale={[$size.width, $size.height, 1]}>
	<T.PlaneGeometry args={[1, 1]} />
	<T.ShaderMaterial
		vertexShader={waveVertexShader}
		fragmentShader={waveFragmentShader}
		{uniforms}
	/>
</T.Mesh>

<T.Mesh
	visible={false}
	position={[0, 0, 0.01]}
	scale={[$size.width, $size.height, 1]}
	onpointermove={(e: any) => {
		if (!enableMouseInteraction || !e.uv) return;
		const dpr = renderer.getPixelRatio();
		const x = e.uv.x * $size.width * dpr;
		const y = (1.0 - e.uv.y) * $size.height * dpr;
		mouse.set(x, y);
	}}
>
	<T.PlaneGeometry args={[1, 1]} />
	<T.MeshBasicMaterial transparent opacity={0} />
</T.Mesh>

/**
 * Phase for the page dither.
 *
 * `performance.now()` resets on each document load, so the wave always opened
 * on the same frame. One offset, chosen once per load, slides that start
 * through the pattern.
 */
const PHASE_SPAN = 10_000;

let phaseOffset: number | undefined;

function offset(): number {
	phaseOffset ??= Math.random() * PHASE_SPAN;
	return phaseOffset;
}

export function ditherTime(): number {
	return (performance.now() / 1000 + offset()) % PHASE_SPAN;
}

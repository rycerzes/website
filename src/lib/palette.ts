/**
 * Single source of truth for the UV palette in JS/TS contexts — mermaid theming,
 * canvas, WebGL, and figure components — where CSS custom properties can't be
 * read directly.
 *
 * These values mirror the `@theme` block in src/app.css and must stay in sync.
 * The site is dark-only, so there is exactly one palette.
 *
 * The surface and border ramps were extracted from the mermaid theme config in
 * MdxContent.svelte, which was the only place the intermediate steps existed.
 */

/** Background ramp, from the page backdrop upward through raised surfaces. */
export const surface = {
	page: '#030205',
	deep: '#0e0a14',
	raised: '#161022',
	overlay: '#211a31',
	/** Warm-shifted; sits off the ramp and is semantic rather than an elevation step. */
	error: '#2a1f34'
} as const;

/** Border ramp, subtle through prominent. */
export const border = {
	subtle: '#3e3450',
	default: '#4c3f63',
	strong: '#5f4e7d'
} as const;

export const text = {
	/** Near-white, for headings and high-contrast labels. */
	primary: '#f5f3ff',
	/** Default body copy. */
	body: '#eaddff',
	/** Muted violet, for secondary labels and axis text. */
	dim: '#d8b4fe'
} as const;

/** Neon violet used for lines, marks, and interactive affordances. */
export const accent = '#a78bfa';

/**
 * Categorical hues for figures carrying several series.
 *
 * These are NOT eyeballed. They are the validated dark-mode steps, checked against this
 * site's figure surface (#0e0a14) with the six-check validator: OKLCH lightness band
 * 0.48-0.67, chroma floor 0.10, CVD separation under protanopia/deuteranopia, a
 * normal-vision floor, and >=3:1 contrast. An earlier hand-picked set (violet/cyan/amber/
 * rose/green/blue) failed the lightness band on all six and put green and rose 7.5 apart
 * under deuteranopia - which would have made a pass/fail encoding unreadable.
 *
 * Order is the CVD-safety mechanism. Assign slots in sequence and never cycle.
 */
export const series = {
	blue: '#3987e5',
	orange: '#d95926',
	aqua: '#199e70',
	yellow: '#c98500',
	magenta: '#d55181',
	green: '#008300',
	violet: '#9085e9',
	red: '#e66767'
} as const;

/** Ordered categorical scale; take the first n for an n-series figure. */
export const categorical = [
	series.blue,
	series.orange,
	series.aqua,
	series.yellow,
	series.magenta,
	series.green,
	series.violet,
	series.red
] as const;

/**
 * Scatter-like figures (roofline, bubble, small multiples) need every pair to separate,
 * not just neighbours. Only the first three slots clear all-pairs CVD; slot 4 collapses
 * into slot 2 (deltaE 4.8 deutan). More than three series there means faceting, not more hues.
 */
export const ALL_PAIRS_SAFE_SERIES = 3;

/**
 * Reserved state colours. Never reuse these for "series 4", and never let one carry
 * meaning alone - always pair with a label or icon. They sit outside the categorical
 * lightness band on purpose, so a status colour cannot impersonate a series.
 */
export const semantic = {
	pass: '#0ca30c',
	warn: '#fab219',
	fail: '#d03b3b'
} as const;

export const palette = {
	surface,
	border,
	text,
	accent,
	series,
	categorical,
	semantic,
	ALL_PAIRS_SAFE_SERIES
} as const;

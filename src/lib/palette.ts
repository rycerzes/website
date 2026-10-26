/**
 * Single source of truth for the palette in JS/TS contexts — mermaid theming,
 * canvas, WebGL, and figure components — where CSS custom properties can't be
 * read directly.
 *
 * These values mirror the `@theme` block in src/app.css and must stay in sync.
 * The site is dark-only, so there is exactly one palette.
 *
 * Everything except the two backdrop steps (`surface.page`, `surface.deep`) is
 * Catppuccin Mocha. The backdrop sits darker than Mocha's crust on purpose.
 */

/** Catppuccin Mocha, verbatim from https://catppuccin.com/palette. Never edit these values. */
export const ctp = {
	rosewater: '#f5e0dc',
	flamingo: '#f2cdcd',
	pink: '#f5c2e7',
	mauve: '#cba6f7',
	red: '#f38ba8',
	maroon: '#eba0ac',
	peach: '#fab387',
	yellow: '#f9e2af',
	green: '#a6e3a1',
	teal: '#94e2d5',
	sky: '#89dceb',
	sapphire: '#74c7ec',
	blue: '#89b4fa',
	lavender: '#b4befe',
	text: '#cdd6f4',
	subtext1: '#bac2de',
	subtext0: '#a6adc8',
	overlay2: '#9399b2',
	overlay1: '#7f849c',
	overlay0: '#6c7086',
	surface2: '#585b70',
	surface1: '#45475a',
	surface0: '#313244',
	base: '#1e1e2e',
	mantle: '#181825',
	crust: '#11111b'
} as const;

/** Background ramp, from the page backdrop upward through raised surfaces. */
export const surface = {
	page: '#030205',
	deep: '#0e0a14',
	raised: ctp.mantle,
	overlay: ctp.base,
	/** ctp.red at 15% over ctp.base. Semantic rather than an elevation step. */
	error: '#3e2e40'
} as const;

/** Border ramp, subtle through prominent. */
export const border = {
	subtle: ctp.surface0,
	default: ctp.surface1,
	strong: ctp.surface2
} as const;

export const text = {
	/** Headings and high-contrast labels. */
	primary: ctp.text,
	/** Default body copy. */
	body: ctp.text,
	/** Secondary labels and axis text. */
	dim: ctp.subtext0
} as const;

/** Used for lines, marks, and interactive affordances. */
export const accent = ctp.mauve;

/**
 * Categorical hues for figures carrying several series: Mocha accents in a validated order.
 *
 * The order is NOT eyeballed. It was searched exhaustively over the Mocha accents and is
 * checked by `bun scripts/check-palette.ts` (OKLab deltaE x100, Machado 2009 simulation):
 * neighbours separate by >= 9 under normal, protan and deutan vision, and every pair within
 * the first three by >= 9.5. The status hues (green, yellow, red) and the accent (mauve) are
 * excluded so a series cannot impersonate either. Maroon would be slot 5 but sits 2.5 from
 * `semantic.fail` under deuteranopia, and every other fifth hue drops neighbours below 7,
 * so the scale stops at four.
 *
 * Order is the CVD-safety mechanism. Assign slots in sequence and never cycle.
 */
export const series = {
	blue: ctp.blue,
	peach: ctp.peach,
	teal: ctp.teal,
	sapphire: ctp.sapphire
} as const;

/** Ordered categorical scale; take the first n for an n-series figure. */
export const categorical = [series.blue, series.peach, series.teal, series.sapphire] as const;

/**
 * Scatter-like figures (roofline, bubble, small multiples) need every pair to separate,
 * not just neighbours. Only the first three slots clear all-pairs CVD; slot 4 collapses
 * into slot 1 (deltaE 4.5 deutan). More than three series there means faceting, not more hues.
 */
export const ALL_PAIRS_SAFE_SERIES = 3;

/**
 * Reserved state colours. Never reuse these as a series, and never let one carry meaning
 * alone - always pair with a label or icon. Under deuteranopia pass and warn are only 2.9
 * apart, and pass is 3.8 from `series.peach`, so the label is what carries the state.
 */
export const semantic = {
	pass: ctp.green,
	warn: ctp.yellow,
	fail: ctp.red
} as const;

export const palette = {
	ctp,
	surface,
	border,
	text,
	accent,
	series,
	categorical,
	semantic,
	ALL_PAIRS_SAFE_SERIES
} as const;

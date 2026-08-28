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

export const palette = { surface, border, text, accent } as const;

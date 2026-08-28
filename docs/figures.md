# Figure spec

House contract for interactive and animated figures in blog posts. Every figure obeys
this so a set of figures reads as one publication rather than N separate weekend projects.

Read this before writing a figure. If a rule here fights the figure you're building, say
so and get the rule changed — don't quietly deviate.

## 1. Scope

A **figure** is any visual that is not prose, a code block, a table, or a mermaid diagram:
charts, diagrams, interactive explainers, animated demos, 3D scenes.

Mermaid covers flow/sequence/state diagrams and is already wired up — use a ```mermaid
fence for those, not a figure. Reach for a figure when the reader needs to _manipulate_
something, or when the thing genuinely moves.

## 2. Location and naming

- One figure = one Svelte component in `src/lib/components/figures/`.
- PascalCase, named for what it shows: `RopeRotation.svelte`, not `Figure3.svelte`.
- Helper modules for a single figure sit beside it in lowerCamelCase:
  `ropeRotation.ts`. See `PretextGengarDemo.svelte` + `pretextDemo.ts`.
- Shared helpers used by three or more figures graduate to `src/lib/figures/`.
- New files use **LF** line endings (`.prettierrc` has no `endOfLine`, so prettier
  defaults to LF). Some existing files are CRLF; don't convert them incidentally.

## 3. Do not copy the HTML-embed pattern

Distill-style templates ship figures as self-contained HTML files with an IIFE, a
`data-mounted` guard, and a hand-rolled `ResizeObserver`. That ceremony exists because
those templates are framework-agnostic. We are not.

A figure here is a Svelte 5 component. No IIFE, no mount guards, no global registry, no
`getElementById`. Use `bind:this` for element refs and `$state`/`$derived` for reactivity.
Multiple instances on one page must work with no extra effort — if they don't, something
is being stored globally that shouldn't be.

## 4. Colors

The site is **dark-only**. There is exactly one palette. Never hardcode a color.

- In markup and CSS: the `--color-uv-*` custom properties from `src/app.css`.
- In JS/TS (canvas, WebGL, any library that needs a string):
  `import { surface, border, text, accent } from '$lib/palette'`.

Ramps, in order:

| role    | tokens                                                                        |
| ------- | ----------------------------------------------------------------------------- |
| surface | `surface.page` → `surface.deep` → `surface.raised` → `surface.overlay`        |
| border  | `border.subtle` → `border.default` → `border.strong`                          |
| text    | `text.primary` (headings/labels) · `text.body` · `text.dim` (axes, secondary) |
| accent  | `accent` — lines, marks, interactive affordances                              |

`surface.error` is warm-shifted and sits **off** the ramp. It is semantic, not an
elevation step; use it only for error states.

Layer deliberately: figure chrome on `surface.deep`, plot area on `surface.raised`,
tooltips and popovers on `surface.overlay`. If you find yourself wanting a shade between
two ramp steps, add a token to both `app.css` and `palette.ts` — do not inline it. Inlined
one-off hexes are exactly the drift this palette exists to prevent.

Categorical series: derive from `accent` by varying lightness/opacity along a single hue
rather than introducing new hues. If a figure genuinely needs more than four
distinguishable series, it probably needs to be two figures.

## 5. Typography

`--font-family-mono` (JetBrains Mono) throughout, matching body copy. Axis and legend
text at 11–12px in `text.dim`; labels at 13–14px in `text.primary`. Never fall back to a
sans stack — a figure in a different typeface reads as an embed from another site.

## 6. Sizing and responsiveness

- Width comes from the container, never a fixed pixel value.
- Default height: `Math.max(240, width / 2.5)`, clamped to something sensible for the
  content. State the clamp explicitly rather than letting aspect ratio drift.
- Use `ResizeObserver` (or Svelte's `bind:clientWidth`, which is simpler and preferred)
  and recompute scales, axes, and label positions on every render.
- Must be legible and operable at 360px wide. Posts render in a `max-w-2xl` column, so
  assume ~672px maximum and design for the narrow end first.
- The figure must never cause horizontal page scroll. Wide content scrolls inside its own
  `overflow-x-auto` container.

## 7. SVG draws, HTML controls

- **SVG**: marks, axes, gridlines, connectors. Chart primitives only.
- **HTML**: every control — sliders, selects, buttons, toggles, legends, tooltips,
  captions. Never `foreignObject`, never SVG-drawn UI.

This split keeps controls accessible and stylable with Tailwind, and keeps the SVG
layer purely about geometry.

Legend swatches: 12×12px, `border-radius: 2px`, 1px `border.default` border — matching
the retro-but-not-round radius used elsewhere in `app.css`.

## 8. Rendering ladder

Pick per figure; don't standardize on one.

| technique               | use when                                                       |
| ----------------------- | -------------------------------------------------------------- |
| SVG + Svelte reactivity | default — diagrams, charts, explainers, up to ~1000 marks      |
| Canvas 2D               | dense scatter, particles, anything past ~1000 marks            |
| Threlte / three.js      | genuinely 3D (already a dependency — see `components/dither/`) |

D3 is **math only**. Import submodules (`d3-scale`, `d3-shape`, `d3-array`, `d3-force`)
for scales, layouts, and path generators. Never the `d3` monolith, never from a CDN, and
never let D3 touch the DOM — Svelte owns the DOM.

Any new dependency needs sign-off before you add it, and is subject to the 7-day
release-age rule.

## 9. Motion

- Use `svelte/motion` (`Tween`, `Spring`) and Svelte's `transition:`/`animate:`
  directives before reaching for anything else.
- Honour `prefers-reduced-motion: reduce`: no autoplay, no looping animation, no
  scroll-linked movement. The figure must still convey its point in a static state.
- Nothing autoplays above a few seconds without a visible pause control.
- Animation serves comprehension. If it's decorative, cut it.

## 10. Interaction and accessibility

- Every control is keyboard-operable and has a real `<label for>`; icon-only buttons get
  `aria-label`.
- Visible focus states — remember Tailwind v4's `outline-hidden` vs `outline-none`
  distinction noted in `AGENTS.md`.
- Hover-only affordances need a keyboard/focus equivalent. Tooltips triggered by hover
  must also appear on focus.
- Put `role="img"` and a descriptive `aria-label` on the **non-interactive visual** — the
  `<svg>` or `<canvas>` — and never on a container that also holds controls. `role="img"`
  makes a subtree opaque to assistive tech, so wrapping the controls in it would hide
  them. Let the label track current state, so it stays true as the reader interacts.
- The `<figcaption>` supplied by `Figure` carries the prose description. It sits outside
  the lazy boundary, so it is present even when the figure itself has not mounted.
- Interaction is progressive: the figure must render something meaningful before any
  input (see §12).

## 11. Prose integration

Posts render inside a long `prose-*` chain in `src/routes/blog/[slug]/+page.svelte`.
Figures must escape it:

Use `Figure` (`src/lib/components/figures/Figure.svelte`) rather than hand-rolling this.
It supplies the `not-prose` escape, the chrome, the reserved height, the lazy boundary,
and the `<figcaption>`. A figure component itself renders **only its content** — no outer
border, no heading bar, no caption of its own.

```svelte
<script lang="ts">
	import Figure from '$lib/components/figures/Figure.svelte';
</script>

<Figure
	height={320}
	caption="What the reader is looking at, and what to notice."
	load={() => import('$lib/components/figures/CoordinateBins.svelte')}
/>
```

`load` dynamically imports the figure so it splits out of the initial bundle; pass the
component as children instead when it is small enough not to warrant a chunk. `height` is
the resting height in px and must match the figure, since it is what prevents layout
shift. `lazy` defaults to true — turn it off only for a figure visible without scrolling.

## 12. Prerendering and cost

Blog routes set `prerender = true`. Figures are server-rendered to static HTML and then
hydrated, so:

- Guard browser-only work with `onMount` or `browser` from `$app/environment`. Never
  touch `window`/`document` at module scope.
- `Figure` reserves the height and owns the `IntersectionObserver` + dynamic `import()`,
  so an individual figure never implements either. Posts here run long — a post with
  eight eagerly-hydrating figures is a payload problem.
- A lazy figure is absent from the prerendered HTML by design; only its chrome and
  caption are static. That is the trade for not shipping every figure up front, and it
  is why the caption must actually describe the figure rather than just label it.

## 13. Data

- Small datasets (under ~100 rows) inline in the component or its helper module.
- Larger data goes in `src/lib/figures/data/` and is imported at build time with
  `import.meta.glob(..., { query: '?raw' })`, the same pattern `src/lib/posts.ts` uses.
  Build-time import, not a runtime fetch — the pages are prerendered.
- No network calls from a figure. No external asset hosts.

## 14. Checklist

Before a figure is done:

- [ ] Zero hardcoded colors; everything from `palette.ts` / `--color-uv-*`
- [ ] Readable and operable at 360px, no horizontal page scroll
- [ ] Two instances on one page work independently
- [ ] Keyboard-operable, labelled, `role="img"` + `aria-label` on the container
- [ ] `prefers-reduced-motion` respected
- [ ] Renders meaningfully before interaction; no layout shift on hydration
- [ ] No `window`/`document` at module scope
- [ ] Lazy-loaded if below the fold
- [ ] `bun run check` clean; `bunx eslint <file>` clean

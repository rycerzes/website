# Theme: Catppuccin Mocha

The site is dark-only and uses [Catppuccin Mocha](https://catppuccin.com/palette). Which
colour goes where follows the official
[Catppuccin style guide](https://github.com/catppuccin/catppuccin/blob/main/docs/style-guide.md).
Read that before picking a colour for a new role; this file only records how the site maps
those roles onto its tokens and where it deliberately departs from the guide.

Figures have their own, stricter rules on top of this: see `docs/figures.md`.

## Where the colours live

| Context                               | Use                                                       |
| ------------------------------------- | --------------------------------------------------------- |
| Markup, Tailwind classes, CSS         | `--color-uv-*` role tokens; `--color-ctp-*` for a raw hue |
| JS/TS (canvas, WebGL, mermaid config) | `$lib/palette` (`ctp`, `surface`, `text`, `accent`, ...)  |
| Iframes, Typst, mermaid `style` lines | Literal Mocha hex values (they cannot read `app.css`)     |

The `--color-ctp-*` values in `src/app.css` and `ctp` in `src/lib/palette.ts` are Mocha
verbatim. Never edit them, and never add a hex that is not either a Mocha value or one of
the derived values below.

## Role mapping

| Style-guide role       | Mocha                 | Site token                                       |
| ---------------------- | --------------------- | ------------------------------------------------ |
| Background pane        | Base                  | `uv-black` (`#030205`) — see deviations          |
| Secondary panes        | Mantle, Crust         | `uv-deep` (`#0e0a14`), `uv-raised` (Mantle)      |
| Popovers, tooltips     | Base                  | `uv-overlay`                                     |
| Surface elements       | Surface 0 / 1 / 2     | `uv-mute`, `uv-border`, `uv-border-strong`       |
| Main headline          | Text                  | `uv-text-main`                                   |
| Body copy              | Text                  | `uv-text-main` for emphasis, `uv-text-dim` today |
| Sub-headlines, labels  | Subtext 0 / 1         | `uv-text-dim` (Subtext 0), `ctp-subtext1`        |
| Subtle text            | Overlay 1             | `ctp-overlay1`                                   |
| On accent              | Crust                 | `ctp-crust` (text on a filled accent)            |
| Links                  | Blue / Lavender / Sky | `uv-highlight` (Mauve), hover `ctp-lavender`     |
| Tags, pills            | Blue                  | `uv-highlight` today                             |
| Success / warn / error | Green / Yellow / Red  | `ctp-green`, `ctp-yellow`, `ctp-red`             |
| Selection background   | Overlay 2 at 20–30%   | `::selection` in `app.css` (30%)                 |
| Cursor                 | Rosewater             | `caret-color` on `html` in `app.css`             |

`html` also sets `color-scheme: dark`, and `app.html` sets `theme-color` to `uv-black`, so
native scrollbars, form controls and the mobile browser bar match the backdrop.

Code blocks use Shiki's `catppuccin-mocha` theme (`svelte.config.js`), so syntax colours
already follow the guide's code-editor table. Inline code is Green, matching the guide's
colour for strings.

## Derived values

Only these non-Mocha colours are allowed:

- **The backdrop**: `uv-black` and `uv-deep`, darker than Crust on purpose.
- **The dither wave**: `ditherWave` in `$lib/palette`, Mauve scaled to 38% so the animated
  backdrop keeps its brightness. Derive from `ctp`, never type shader colours by hand.
- **Tints**: an accent at 15% over Base, the same mix Catppuccin uses for diff
  backgrounds. Use `color-mix(in srgb, var(--color-ctp-<hue>) 15%, var(--color-ctp-base))`
  in CSS. Where only a literal works (mermaid, Typst), these are the precomputed values:

| Tint         | Hex       | Used for                                    |
| ------------ | --------- | ------------------------------------------- |
| Red 15%      | `#3e2e40` | `uv-error`, failing nodes in diagrams       |
| Green 15%    | `#323c3f` | passing / success nodes in diagrams         |
| Blue 15%     | `#2e354d` | diagram nodes paired with a Blue stroke     |
| Peach 15%    | `#3f343b` | diagram nodes paired with a Peach stroke    |
| Lavender 15% | `#35364d` | diagram nodes paired with a Lavender stroke |

Pair a tinted fill with the full-strength hue as its stroke, and Text (`#cdd6f4`) for the
label. For any other hue, compute the same 15% mix over Base rather than eyeballing one.

## Deviations from the style guide

- **Backdrop is darker than Base.** The page sits on `uv-black` with the dither
  background on top; Base reads as grey against it. This is intentional and should stay.
- **Mauve is the accent, not Blue.** Links, active nav, focus marks and the "for those who
  come after" line use Mauve (`uv-highlight`), where the guide says Blue for links and
  tags. Don't switch individual elements to Blue; if that changes, it changes in
  `--color-uv-highlight` and `accent` together.
- **Body copy is mostly Subtext 0.** Long-form text uses `uv-text-dim` rather than Text,
  to keep the page quiet. Headlines and emphasis use Text.

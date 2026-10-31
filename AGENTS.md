# Agent Guidelines

## Commands

- **Package Manager**: npm, pinned by `packageManager`. Node is pinned in `.node-version` for fnm. Use `npm install`, `npm run ...`.
- **Dev Server**: `npm run dev`
- **Type Check**: `npm run check` (runs `svelte-check`)
- **Lint**: `npm run lint` (ESLint + Prettier)
- **Format**: `npm run format`
- **Tests**: No test runner is currently configured.

## Code Style

- **Framework**: Svelte 5. Use **Runes** (`$state`, `$effect`, `$props`) for reactivity.
- **TypeScript**: strict mode enabled. explicit types preferred.
- **Styling**: Tailwind CSS v4. Use `clsx` and `tailwind-merge`.
- **Formatting**: Prettier defaults with `useTabs: true`, `singleQuote: true`, `printWidth: 100`, `trailingComma: "none"`.
- **Components**: PascalCase (e.g., `CommandPalette.svelte`).
- **Figures**: interactive/animated post figures live in `src/lib/components/figures/` and follow `docs/figures.md`. Read that before adding one.
- **Imports**: Use named imports. Prefer `$lib` alias for internal imports.

## Rules

- **Svelte 5**: Do not use legacy `export let` or `$:`. Use Runes.
- **Tailwind v4**:
  - Use `@import "tailwindcss";` (no `@tailwind` directives).
  - Use `outline-hidden` for invisible outlines. `outline-none` now removes style.
  - **Shadows/Radius**: `*-sm` is now `*-xs`. The new `*-sm` is bigger.
  - **Svelte Integration**: In `<style>` blocks, use `@reference "../../app.css";` to access theme vars/`@apply`.
  - **Arbitrary values**: Use `()` instead of `[]` for vars (e.g., `bg-(--color)`).
- **No rounded corners**: nothing on the site is rounded. Don't add `rounded-*` utilities or `border-radius`; dots and pills are squares and rectangles too. Circles that are data marks in figures (scatter points, rings) are fine.
- **Error Handling**: Use try/catch blocks for async operations.
- **Env**: Use `$env/dynamic/private` for sensitive server-side env vars.
- **Theme**: The site is dark-only. `<html>` always carries `class="dark"`. The palette is Catppuccin Mocha over the site's own backdrop (`uv-black`, `uv-deep`). Never hardcode colors — use `--color-uv-*` role tokens (or `--color-ctp-*` for a raw Mocha colour) in CSS, `$lib/palette` in JS. Read `docs/theme.md` before choosing a colour for a role; it maps the [Catppuccin style guide](https://github.com/catppuccin/catppuccin/blob/main/docs/style-guide.md) onto the site tokens and lists the deliberate deviations.

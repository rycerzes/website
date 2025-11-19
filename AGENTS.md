# Agent Guidelines

## Commands

- **Package Manager**: `bun` is preferred (`bun.lock` exists). Use `bun install`, `bun run ...`.
- **Dev Server**: `bun run dev`
- **Type Check**: `bun run check` (runs `svelte-check`)
- **Lint**: `bun run lint` (ESLint + Prettier)
- **Format**: `bun run format`
- **Database**: `bun run db:push`, `bun run db:migrate`, `bun run db:studio` (Drizzle/Neon)
- **Tests**: No test runner is currently configured.

## Code Style

- **Framework**: Svelte 5. Use **Runes** (`$state`, `$effect`, `$props`) for reactivity.
- **TypeScript**: strict mode enabled. explicit types preferred.
- **Styling**: Tailwind CSS v4. Use `clsx` and `tailwind-merge`.
- **Formatting**: Prettier defaults with `useTabs: true`, `singleQuote: true`, `printWidth: 100`, `trailingComma: "none"`.
- **Database**: Drizzle ORM. Schema in `src/lib/server/db/schema.ts`.
- **Components**: PascalCase (e.g., `ThemeToggle.svelte`).
- **Imports**: Use named imports. Prefer `$lib` alias for internal imports.

## Rules

- **Svelte 5**: Do not use legacy `export let` or `$:`. Use Runes.
- **Tailwind v4**:
  - Use `@import "tailwindcss";` (no `@tailwind` directives).
  - Use `outline-hidden` for invisible outlines. `outline-none` now removes style.
  - **Shadows/Radius**: `*-sm` is now `*-xs`. The new `*-sm` is bigger.
  - **Svelte Integration**: In `<style>` blocks, use `@reference "../../app.css";` to access theme vars/`@apply`.
  - **Arbitrary values**: Use `()` instead of `[]` for vars (e.g., `bg-(--color)`).
- **Error Handling**: Use try/catch blocks for async operations, especially DB calls.
- **Env**: Use `$env/dynamic/private` for sensitive server-side env vars.

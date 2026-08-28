Libertinus Sans 7.051 — vendored for build-time Typst diagram rendering only.

These faces are read by src/lib/mdx/rehype-typst-diagram.js via the Typst
compiler's fontArgs option. They are NOT served to browsers; the site's web font
is JetBrains Mono, loaded in src/routes/+layout.svelte.

Vendored so diagram rendering is reproducible across machines. Without them Typst
silently falls back to whatever the build host happens to provide, which differs
between a local macOS checkout and the Cloudflare build container.

Source:  https://github.com/alerque/libertinus/releases/tag/v7.051
License: SIL Open Font License 1.1 — see OFL.txt

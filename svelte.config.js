import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import rehypeMermaid from 'rehype-mermaid';
import rehypePrettyCode from 'rehype-pretty-code';

/**
 * Svelte warns when noninteractive elements (like <pre>) have tabindex >= 0.
 * rehype-pretty-code adds tabindex="0" for focusability; strip it to keep a11y checks clean.
 */
function rehypeStripPreTabindex() {
	return function transformer(tree) {
		function visit(node) {
			if (!node || typeof node !== 'object') return;

			if (node.type === 'element' && node.tagName === 'pre' && node.properties) {
				if ('tabindex' in node.properties) {
					delete node.properties.tabindex;
				}
				if ('tabIndex' in node.properties) {
					delete node.properties.tabIndex;
				}
			}

			if (Array.isArray(node.children)) {
				for (const child of node.children) {
					visit(child);
				}
			}
		}

		visit(tree);
	};
}

/** @type {import('rehype-pretty-code').Options} */
const prettyCodeOptions = {
	theme: 'github-dark-dimmed',
	keepBackground: false
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [
		vitePreprocess(),
		mdsvex({
			extensions: ['.md', '.svx', '.mdx'],
			highlight: false,
			rehypePlugins: [
				[rehypeMermaid, { strategy: 'pre-mermaid' }],
				[rehypePrettyCode, prettyCodeOptions],
				rehypeStripPreTabindex
			]
		}),
		{
			name: 'mdsvex-deprecation-fix',
			markup({ content, filename }) {
				if (
					filename &&
					(filename.endsWith('.md') || filename.endsWith('.svx') || filename.endsWith('.mdx'))
				) {
					return {
						code: content.replace('context="module"', 'module')
					};
				}
			}
		}
	],
	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter()
	},
	extensions: ['.svelte', '.svx', '.md', '.mdx'],
	compilerOptions: {
		runes: true
	}
};

export default config;

import { NodeCompiler } from '@myriaddreamin/typst-ts-node-compiler';
import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic';
import { visit } from 'unist-util-visit';

/**
 * @typedef {object} HastNode
 * @property {string} type
 * @property {string=} tagName
 * @property {string=} value
 * @property {Record<string, unknown>=} properties
 * @property {HastNode[]=} children
 */

const compiler = NodeCompiler.create({ workspace: process.cwd() });
const cache = new Map();

/** @type {Record<string, string>} */
const htmlEntities = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" };
const entityPattern = /&(?:amp|lt|gt|quot|#39);/g;

/** @param {string} s */
function decodeEntities(s) {
	return s.replace(entityPattern, (m) => htmlEntities[m]);
}

/**
 * @param {unknown} error
 * @returns {string}
 */
function diagnosticMessage(error) {
	if (!error) return 'Unknown Typst compilation error';
	if (typeof error === 'object' && 'shortDiagnostics' in error) {
		return JSON.stringify(error.shortDiagnostics);
	}
	return error instanceof Error ? error.message : String(error);
}

/**
 * @param {string} source
 * @returns {string}
 */
function renderTypstToSvg(source) {
	const cached = cache.get(source);
	if (cached) return cached;

	const template = `#import "@preview/cetz:0.4.2": canvas, draw
#set page(width: auto, height: auto, margin: 0pt, fill: rgb("#030205"))
#set text(fill: rgb("#f5f3ff"), font: "Linux Biolinum")

#canvas({
  ${source}
})`;
	const result = compiler.compile({ mainFileContent: template });

	if (!result.result) {
		result.printDiagnostics();
		result.printErrors();
		const diagnostics = result.takeDiagnostics();
		const error = result.takeError();
		throw new Error(
			[
				diagnostics ? `diagnostics=${diagnosticMessage(diagnostics)}` : '',
				error ? `error=${diagnosticMessage(error)}` : ''
			]
				.filter(Boolean)
				.join(' ')
		);
	}

	const svg = compiler.svg(result.result);
	compiler.evictCache(10);
	cache.set(source, svg);

	return svg;
}

/**
 * typst.ts's `svg()` export can emit `<use href="#gXXXX">` glyph references whose
 * `<defs>` entry it never wrote. This reproduces on a fresh compiler, for a single
 * document, across every font we tried, so it is an upstream defect rather than
 * anything to do with compiler reuse or font fallback.
 *
 * An unresolvable `<use>` renders nothing, so dropping it is visually a no-op. What
 * it buys is markup without dangling fragment references — which SvelteKit's
 * prerenderer correctly rejects, and which otherwise makes the build pass or fail
 * depending on whether the glyph hash happens to contain a base64 `+` or `/`.
 *
 * @param {HastNode} svgNode
 * @returns {number} count of references dropped
 */
function dropDanglingGlyphRefs(svgNode) {
	/** @type {Set<string>} */
	const defined = new Set();
	visit(/** @type {import('unist').Node} */ (svgNode), 'element', (node) => {
		const id = /** @type {HastNode} */ (node).properties?.id;
		if (typeof id === 'string') defined.add(id);
	});

	let dropped = 0;
	visit(/** @type {import('unist').Node} */ (svgNode), 'element', (node, index, parent) => {
		const element = /** @type {HastNode} */ (node);
		const parentNode = /** @type {HastNode | undefined} */ (parent);
		if (element.tagName !== 'use' || !parentNode?.children || typeof index !== 'number') return;

		const href = element.properties?.href ?? element.properties?.xlinkHref;
		if (typeof href !== 'string' || !href.startsWith('#')) return;
		if (defined.has(href.slice(1))) return;

		parentNode.children.splice(index, 1);
		dropped += 1;
		// re-visit this index; it now holds the following sibling
		return index;
	});

	return dropped;
}

export default function rehypeTypstDiagram() {
	/**
	 * @param {HastNode} tree
	 */
	return function transformer(tree) {
		visit(/** @type {import('unist').Node} */ (tree), 'element', (node, index, parent) => {
			const element = /** @type {HastNode} */ (node);
			const parentNode = /** @type {HastNode | undefined} */ (parent);
			if (!parentNode || typeof index !== 'number' || element.tagName !== 'pre') return;

			const code = element.children?.find((child) => child.type === 'element' && child.tagName === 'code');
			const className = code?.properties?.className;
			if (!Array.isArray(className) || !className.includes('language-typst-diagram')) return;
			if (!code) return;

			const rawSource = code.children?.[0]?.value ?? '';
			if (!rawSource.trim()) return;
			const source = decodeEntities(rawSource);

			try {
				const svg = renderTypstToSvg(source);
				const root = fromHtmlIsomorphic(svg, { fragment: true });
				const svgNode = root.children?.[0];

				if (svgNode) {
					const dropped = dropDanglingGlyphRefs(/** @type {HastNode} */ (svgNode));
					if (dropped > 0) {
						console.warn(
							`typst-diagram: dropped ${dropped} glyph reference(s) with no matching definition`
						);
					}
				}

				if (!parentNode?.children) return;
				parentNode.children[index] = {
					type: 'element',
					tagName: 'figure',
					properties: { className: ['typst-diagram'] },
					children: svgNode ? [svgNode] : []
				};
			} catch (error) {
				const message = diagnosticMessage(error);
				console.error(`Failed to compile typst-diagram block: ${message}`);
				if (!parentNode?.children) return;
				parentNode.children[index] = {
					type: 'element',
					tagName: 'div',
					properties: { className: ['typst-diagram-error'] },
					children: [
						{
							type: 'element',
							tagName: 'strong',
							properties: {},
							children: [{ type: 'text', value: `Typst diagram failed to compile: ${message}` }]
						},
						{
							type: 'element',
							tagName: 'pre',
							properties: {},
							children: [
								{
									type: 'element',
									tagName: 'code',
									properties: {},
									children: [{ type: 'text', value: source }]
								}
							]
						}
					]
				};
			}
		});
	};
}

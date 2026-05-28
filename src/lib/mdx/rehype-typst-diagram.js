import { NodeCompiler } from '@myriaddreamin/typst-ts-node-compiler';
import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic';
import { visit } from 'unist-util-visit';

/**
 * @typedef {object} HastNode
 * @property {string} type
 * @property {string=} tagName
 * @property {string=} value
 * @property {{ className?: unknown }=} properties
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

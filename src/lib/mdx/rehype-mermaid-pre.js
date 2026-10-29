import { visit } from 'unist-util-visit';

/**
 * @typedef {object} HastNode
 * @property {string} type
 * @property {string=} tagName
 * @property {string=} value
 * @property {Record<string, unknown>=} properties
 * @property {HastNode[]=} children
 */

/** @param {HastNode} node */
function isMermaidCode(node) {
	if (node.type !== 'element' || node.tagName !== 'code') return false;
	const className = node.properties?.className;
	const classes = typeof className === 'string' ? className.split(/\s+/) : className;
	return Array.isArray(classes) && classes.includes('language-mermaid');
}

/** @param {HastNode} node @returns {string} */
function textOf(node) {
	if (node.type === 'text') return node.value ?? '';
	return (node.children ?? []).map(textOf).join('');
}

/**
 * Rewrites ```mermaid fences into `<pre class="mermaid">`; MdxContent renders them client-side
 * so the diagrams pick up the site palette.
 */
export default function rehypeMermaidPre() {
	/** @param {HastNode} tree */
	return function transformer(tree) {
		visit(
			/** @type {any} */ (tree),
			'element',
			/**
			 * @param {HastNode} node
			 * @param {number | undefined} index
			 * @param {HastNode | undefined} parent
			 */
			(node, index, parent) => {
				if (node.tagName !== 'pre' || index === undefined || !parent?.children) return;

				const code = node.children?.find(isMermaidCode);
				if (!code) return;
				const others = node.children?.filter((child) => child !== code) ?? [];
				if (others.some((child) => child.type !== 'text' || /\w/.test(child.value ?? ''))) return;

				parent.children[index] = {
					type: 'element',
					tagName: 'pre',
					properties: { className: ['mermaid'] },
					children: [{ type: 'text', value: textOf(code) }]
				};
			}
		);
	};
}

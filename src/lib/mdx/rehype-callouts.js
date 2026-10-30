import { visit } from 'unist-util-visit';

/**
 * @typedef {object} HastNode
 * @property {string} type
 * @property {string=} tagName
 * @property {string=} value
 * @property {Record<string, unknown>=} properties
 * @property {HastNode[]=} children
 */

const KINDS = {
	tldr: 'tl;dr',
	note: 'note',
	tip: 'tip',
	important: 'important',
	warning: 'warning',
	caution: 'caution'
};

const MARKER = /^\s*\[!(\w+)\]\s*/;

/**
 * Turns GitHub-style alerts (`> [!TLDR]`, `> [!NOTE]`, …) into
 * `<aside class="callout callout-tldr">` with a title row. Any other blockquote is left alone.
 */
export default function rehypeCallouts() {
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
				if (node.tagName !== 'blockquote' || index === undefined || !parent?.children) return;

				const first = node.children?.find((c) => c.type === 'element');
				const text = first?.tagName === 'p' ? first.children?.[0] : undefined;
				if (text?.type !== 'text') return;
				const match = MARKER.exec(text.value ?? '');
				if (!match) return;
				const kind = match[1].toLowerCase();
				if (!(kind in KINDS)) return;

				text.value = (text.value ?? '').slice(match[0].length);
				// drop the marker's paragraph when it held nothing else
				const body = (node.children ?? []).filter(
					(c) => !(c === first && (first.children ?? []).every((t) => !/\S/.test(t.value ?? '')))
				);

				parent.children[index] = {
					type: 'element',
					tagName: 'aside',
					properties: { className: ['callout', `callout-${kind}`] },
					children: [
						{
							type: 'element',
							tagName: 'p',
							properties: { className: ['callout-title'] },
							children: [{ type: 'text', value: KINDS[/** @type {keyof typeof KINDS} */ (kind)] }]
						},
						...body
					]
				};
			}
		);
	};
}

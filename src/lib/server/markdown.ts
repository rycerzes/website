import type { Post } from '$lib/types';

export type AgentPage = {
	title: string;
	description: string;
	image: string;
	jsonLd: string;
};

/** True when the client asked for markdown ahead of HTML. Browsers do not. */
export function prefersMarkdown(accept: string | null): boolean {
	if (!accept) return false;

	const types = accept.split(',').map((part) => {
		const [rawType, ...params] = part.trim().split(';');
		const qParam = params.map((param) => param.trim()).find((param) => param.startsWith('q='));
		const q = qParam ? Number(qParam.slice(2)) : 1;
		return { type: rawType.trim().toLowerCase(), q: Number.isFinite(q) ? q : 1 };
	});

	const markdown = types.find((entry) => entry.type === 'text/markdown');
	if (!markdown || markdown.q <= 0) return false;

	const html = types.find((entry) => entry.type === 'text/html');
	if (!html) return true;
	return markdown.q > html.q;
}

function decodeEntities(value: string): string {
	return value
		.replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
		.replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;|&apos;/g, "'");
}

function absoluteUrl(href: string, pageUrl: string): string {
	try {
		return new URL(href, pageUrl).href;
	} catch {
		return href;
	}
}

function yamlString(value: string): string {
	return JSON.stringify(value);
}

/**
 * Cloudflare Markdown for Agents document: frontmatter from the page's title,
 * description, and image, then the body, then any JSON-LD in one json fence.
 */
function agentDocument(page: AgentPage, body: string): string {
	const fields = [
		page.title ? `title: ${yamlString(page.title)}` : '',
		page.description ? `description: ${yamlString(page.description)}` : '',
		page.image ? `image: ${yamlString(page.image)}` : ''
	].filter(Boolean);

	const parts = [fields.length ? `---\n${fields.join('\n')}\n---\n\n` : '', body.trim()];
	const jsonLd = page.jsonLd.trim();
	if (jsonLd) parts.push(`\n\n\`\`\`json\n${jsonLd}\n\`\`\``);
	return `${parts
		.join('')
		.replace(/\n{3,}/g, '\n\n')
		.trim()}\n`;
}

function metaContent(html: string, attr: 'name' | 'property', value: string): string {
	const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
	for (const tag of tags) {
		if (!new RegExp(`${attr}\\s*=\\s*["']${value}["']`, 'i').test(tag)) continue;
		const content = /content\s*=\s*["']([^"']*)["']/i.exec(tag)?.[1];
		if (content) return decodeEntities(content);
	}
	return '';
}

function jsonLdFromHtml(html: string): string {
	return [
		...html.matchAll(
			/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
		)
	]
		.map((match) => match[1].trim())
		.filter(Boolean)
		.join('\n');
}

function figureCaption(tag: string): string {
	const match = /caption\s*=\s*(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\})/.exec(tag);
	return (match?.[1] ?? match?.[2] ?? match?.[3] ?? '').trim();
}

/** Interactive figures have no markdown equivalent. Keep the caption, which is the prose. */
function replaceFigures(source: string): string {
	let out = '';
	let index = 0;

	while (index < source.length) {
		const start = source.indexOf('<Figure', index);
		if (start === -1) {
			out += source.slice(index);
			break;
		}

		out += source.slice(index, start);
		let cursor = start + '<Figure'.length;
		let quote: string | null = null;
		let selfClosing = false;
		let openEnd = -1;

		for (; cursor < source.length; cursor++) {
			const char = source[cursor];
			if (quote) {
				if (char === quote) quote = null;
				continue;
			}
			if (char === '"' || char === "'" || char === '`') {
				quote = char;
				continue;
			}
			if (char === '/' && source[cursor + 1] === '>') {
				selfClosing = true;
				openEnd = cursor + 2;
				break;
			}
			if (char === '>') {
				openEnd = cursor + 1;
				break;
			}
		}

		if (openEnd === -1) {
			out += source.slice(start);
			break;
		}

		const openTag = source.slice(start, openEnd);
		let end = openEnd;
		if (!selfClosing) {
			const close = source.indexOf('</Figure>', openEnd);
			end = close === -1 ? source.length : close + '</Figure>'.length;
		}

		const caption = figureCaption(openTag);
		out += caption
			? `\n\n${caption
					.split('\n')
					.map((line) => line.trim())
					.filter(Boolean)
					.map((line) => `> ${line}`)
					.join('\n')}\n\n`
			: '\n\n';
		index = end;
	}

	return out;
}

/**
 * A blog post is already markdown. Serve that source instead of converting the
 * rendered HTML, which drops fences, tables, and math. Figures become their captions.
 */
export function postToMarkdown(source: string, post: Post, page: AgentPage): string {
	let body = source.replace(/^---[\s\S]*?---\s*/, '');
	body = body.replace(/<script\b[\s\S]*?<\/script>/gi, '');
	body = replaceFigures(body)
		.replace(/\n{3,}/g, '\n\n')
		.trim();

	const details = [post.date, post.readingTime, post.tags.join(', ')].filter(Boolean).join(' · ');
	const article = [`# ${post.title}`, details, body].filter(Boolean).join('\n\n');
	return agentDocument(page, article);
}

/**
 * HTML pages other than posts. Chrome is dropped; the remaining text is a
 * markdown pass. Posts use {@link postToMarkdown}.
 */
export function htmlToMarkdown(html: string, pageUrl: string): string {
	const title = decodeEntities(
		html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? ''
	).replace(/\s+/g, ' ');
	const description =
		metaContent(html, 'name', 'description') || metaContent(html, 'property', 'og:description');
	const image = metaContent(html, 'property', 'og:image');

	let body = html
		.replace(/<script[\s\S]*?<\/script>/gi, '')
		.replace(/<style[\s\S]*?<\/style>/gi, '')
		.replace(/<svg[\s\S]*?<\/svg>/gi, '')
		.replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
		.replace(/<nav[\s\S]*?<\/nav>/gi, '')
		.replace(/<footer[\s\S]*?<\/footer>/gi, '');

	const main = body.match(/<main[\s\S]*?<\/main>/i)?.[0];
	body = main ?? body;

	body = body.replace(
		/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
		(_, href: string, text: string) => {
			const label = decodeEntities(text.replace(/<[^>]+>/g, ''))
				.replace(/\s+/g, ' ')
				.trim();
			if (!label) return '';
			return `[${label}](${absoluteUrl(href, pageUrl)})`;
		}
	);

	body = body.replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level: string, text: string) => {
		const label = decodeEntities(text.replace(/<[^>]+>/g, ''))
			.replace(/\s+/g, ' ')
			.trim();
		return `\n\n${'#'.repeat(Number(level))} ${label}\n\n`;
	});

	body = body.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (_, text: string) => {
		const label = decodeEntities(text.replace(/<[^>]+>/g, ''))
			.replace(/\s+/g, ' ')
			.trim();
		return label ? `\n- ${label}` : '';
	});

	body = body
		.replace(/<br\s*\/?>/gi, '\n')
		.replace(/<\/(p|div|section|article|blockquote|ul|ol|pre|tr|h[1-6])>/gi, '\n\n');
	body = decodeEntities(body.replace(/<[^>]+>/g, ''));
	body = body
		.replace(/[ \t]+\n/g, '\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim();

	return agentDocument({ title, description, image, jsonLd: jsonLdFromHtml(html) }, body);
}

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

/**
 * A readable markdown pass over the rendered page, for clients that ask for
 * `text/markdown`. It keeps the article text and drops chrome.
 */
export function htmlToMarkdown(html: string, pageUrl: string): string {
	const title = decodeEntities(
		html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? ''
	).replace(/\s+/g, ' ');

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
			return `\n\n[${label}](${absoluteUrl(href, pageUrl)})\n\n`;
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
		.replace(/<\/(p|div|section|article|blockquote|ul|ol|pre|tr)>/gi, '\n\n');
	body = decodeEntities(body.replace(/<[^>]+>/g, ''));
	body = body
		.replace(/[ \t]+\n/g, '\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim();

	const heading = title ? `# ${title}\n\n` : '';
	return `---\ntitle: ${title}\nurl: ${pageUrl}\ncontent-signal: search=yes, ai-train=no, ai-input=yes\n---\n\n${heading}${body}\n`;
}

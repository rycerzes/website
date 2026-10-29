import { redirect, type Handle } from '@sveltejs/kit';
import { CONTENT_SIGNAL, SITE_ORIGIN } from '$lib/server/seo';
import { htmlToMarkdown, prefersMarkdown } from '$lib/server/markdown';

const APEX = 'rycerz.es';

export const handle: Handle = async ({ event, resolve }) => {
	const { url } = event;

	if (url.hostname === `www.${APEX}` || (url.hostname === APEX && url.protocol === 'http:')) {
		redirect(301, `${SITE_ORIGIN}${url.pathname}${url.search}`);
	}

	if (url.pathname === '/blog/blogs' || url.pathname.startsWith('/blog/blogs/')) {
		const canonicalPath = url.pathname.replace(/^\/blog\/blogs/, '/blog') || '/blog';
		redirect(301, `${canonicalPath}${url.search}`);
	}

	const response = await resolve(event);
	const type = response.headers.get('content-type') ?? '';
	const headers = new Headers(response.headers);

	if (type.includes('text/html')) {
		headers.append('Vary', 'Accept');
		headers.set('Content-Signal', CONTENT_SIGNAL);
		headers.append('Link', `<${SITE_ORIGIN}/sitemap.xml>; rel="sitemap"`);
	}

	const wantsMarkdown =
		event.request.method === 'GET' &&
		response.status === 200 &&
		type.includes('text/html') &&
		prefersMarkdown(event.request.headers.get('accept'));

	if (!wantsMarkdown) {
		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers
		});
	}

	const html = await response.text();
	const pageUrl = `${SITE_ORIGIN}${url.pathname === '/' ? '/' : url.pathname}`;
	const markdown = htmlToMarkdown(html, pageUrl);
	headers.set('content-type', 'text/markdown; charset=utf-8');
	headers.set('x-markdown-tokens', String(Math.ceil(markdown.length / 4)));
	headers.delete('content-length');

	return new Response(markdown, { status: 200, headers });
};

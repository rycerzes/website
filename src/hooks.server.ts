import { redirect, type Handle } from '@sveltejs/kit';
import { getPost, getPostSource } from '$lib/posts';
import { CONTENT_SIGNAL, seoFor, SITE_ORIGIN } from '$lib/server/seo';
import { htmlToMarkdown, postToMarkdown, prefersMarkdown } from '$lib/server/markdown';

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

	const slug = /^\/blog\/([^/]+)\/?$/.exec(url.pathname)?.[1];
	const source = slug ? getPostSource(slug) : undefined;
	const post = slug ? getPost(slug) : undefined;
	const pageUrl = `${SITE_ORIGIN}${url.pathname === '/' ? '/' : url.pathname}`;
	const markdown =
		source && post
			? postToMarkdown(source, post, seoFor(url.pathname))
			: htmlToMarkdown(await response.text(), pageUrl);
	headers.set('content-type', 'text/markdown; charset=utf-8');
	headers.delete('content-length');
	headers.delete('content-encoding');
	headers.delete('etag');
	headers.delete('last-modified');

	return new Response(markdown, { status: 200, headers });
};

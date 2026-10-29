import { sitemapXml } from '$lib/server/seo';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
	return new Response(sitemapXml(), {
		headers: {
			'content-type': 'application/xml; charset=utf-8',
			'cache-control': 'public, max-age=3600'
		}
	});
};

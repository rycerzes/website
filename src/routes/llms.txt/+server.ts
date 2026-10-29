import { CONTENT_SIGNAL, llmsTxt } from '$lib/server/seo';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
	return new Response(llmsTxt(), {
		headers: {
			'content-type': 'text/plain; charset=utf-8',
			'cache-control': 'public, max-age=3600',
			'Content-Signal': CONTENT_SIGNAL
		}
	});
};

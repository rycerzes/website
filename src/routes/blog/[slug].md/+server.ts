import { error } from '@sveltejs/kit';
import { getPost, getPostSource, getPosts } from '$lib/posts';
import { postToMarkdown } from '$lib/server/markdown';
import { CONTENT_SIGNAL, seoFor } from '$lib/server/seo';
import type { EntryGenerator, RequestHandler } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () => getPosts().map((post) => ({ slug: post.slug }));

export const GET: RequestHandler = ({ params }) => {
	const post = getPost(params.slug);
	const source = getPostSource(params.slug);
	if (!post || !source) error(404, 'Post not found');

	return new Response(postToMarkdown(source, post, seoFor(`/blog/${post.slug}`)), {
		headers: {
			'content-type': 'text/markdown; charset=utf-8',
			'cache-control': 'public, max-age=3600',
			'Content-Signal': CONTENT_SIGNAL
		}
	});
};

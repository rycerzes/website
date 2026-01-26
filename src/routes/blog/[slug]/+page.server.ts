import { getPosts } from '$lib/posts';
import { error } from '@sveltejs/kit';

export const prerender = true;

export function load({ params }) {
    const posts = getPosts();
    const post = posts.find((p) => p.slug === params.slug);

    if (!post) {
        throw error(404, 'Post not found');
    }

    return {
        post
    };
}

import type { Post } from './types';

// eager: true forces the import to happen at build time/startup, 
// so we get the module immediately.
const glob_import = import.meta.glob('/src/posts/*.mdx', { eager: true });

export function getPosts(): Post[] {
    const posts: Post[] = [];

    for (const [path, resolver] of Object.entries(glob_import)) {
        // path is like "/src/posts/my-post.md"
        const filename = path.split('/').pop()?.split('.').shift();

        if (!filename) continue;

        const metadata = (resolver as any).metadata;
        const component = (resolver as any).default;

        // Skip if essential metadata is missing, or provide defaults
        if (!metadata) continue;

        posts.push({
            slug: filename,
            title: metadata.title || 'Untitled',
            date: metadata.date || new Date().toISOString(),
            excerpt: metadata.excerpt || '',
            tags: metadata.tags || [],
            cover: metadata.cover || '',
            // component: component // Exclude component from list to avoid serialization issues
        });
    }

    // Sort by date descending (newest first)
    return posts.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
}

export function getPost(slug: string): Post | undefined {
    for (const [path, resolver] of Object.entries(glob_import)) {
        const filename = path.split('/').pop()?.split('.').shift();
        if (filename === slug) {
            const metadata = (resolver as any).metadata;
            const component = (resolver as any).default;
            return {
                slug: filename,
                title: metadata.title || 'Untitled',
                date: metadata.date || new Date().toISOString(),
                excerpt: metadata.excerpt || '',
                tags: metadata.tags || [],
                cover: metadata.cover || '',
                component: component
            };
        }
    }
    return undefined;
}

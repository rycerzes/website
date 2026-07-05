import type { Post } from './types';

const WORDS_PER_MINUTE = 200;

// eager: true forces the import to happen at build time/startup,
// so we get the module immediately.
const glob_import = import.meta.glob('/src/posts/*.mdx', { eager: true });
const rawPostImport = import.meta.glob('/src/posts/*.mdx', { eager: true, query: '?raw', import: 'default' });

function parsePostDate(date: string): number {
	const ddMmYyyyMatch = /^(\d{2})-(\d{2})-(\d{4})$/.exec(date);
	if (ddMmYyyyMatch) {
		const [, day, month, year] = ddMmYyyyMatch;
		return Date.UTC(Number(year), Number(month) - 1, Number(day));
	}

	const timestamp = Date.parse(date);
	return Number.isNaN(timestamp) ? 0 : timestamp;
}

function stripReadableMarkdown(source: string): string {
	return source
		.replace(/^---[\s\S]*?---/, ' ')
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/`[^`]*`/g, ' ')
		.replace(/^\s*(import|export)\s.+$/gm, ' ')
		.replace(/<script[\s\S]*?<\/script>/gi, ' ')
		.replace(/<style[\s\S]*?<\/style>/gi, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
		.replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
		.replace(/[#>*_~|[\]()`{}:;.,!?/\\-]/g, ' ');
}

function getReadingTime(path: string): string {
	const rawSource = rawPostImport[path];
	const content = typeof rawSource === 'string' ? rawSource : '';
	const words = stripReadableMarkdown(content).match(/\b[\p{L}\p{N}][\p{L}\p{N}'-]*\b/gu) ?? [];
	const minutes = Math.max(1, Math.ceil(words.length / WORDS_PER_MINUTE));

	return `${minutes} min read`;
}

export function getPosts(): Post[] {
	const posts: Post[] = [];

	for (const [path, resolver] of Object.entries(glob_import)) {
		// path is like "/src/posts/my-post.md"
		const filename = path.split('/').pop()?.split('.').shift();

		if (!filename) continue;

		const metadata = (resolver as any).metadata;

		// Skip if essential metadata is missing, or provide defaults
		if (!metadata) continue;

		posts.push({
			slug: filename,
			title: metadata.title || 'Untitled',
			date: metadata.date || new Date().toISOString(),
			excerpt: metadata.excerpt || '',
			tags: metadata.tags || [],
			cover: metadata.cover || '',
			readingTime: getReadingTime(path)
			// component: component // Exclude component from list to avoid serialization issues
		});
	}

	// Sort by date descending (newest first)
	return posts.sort((a, b) => {
		return parsePostDate(b.date) - parsePostDate(a.date);
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
				readingTime: getReadingTime(path),
				component: component
			};
		}
	}
	return undefined;
}

import { getPost, getPosts } from '$lib/posts';

export const SITE_ORIGIN = 'https://rycerz.es';
export const SITE_NAME = 'swappy';
export const CONTENT_SIGNAL = 'search=yes, ai-train=no, ai-input=yes';
export const OG_IMAGE_PATH = '/banner.png';
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const OG_IMAGE_ALT = 'swappy — rycerz.es';

export type PageSeo = {
	title: string;
	description: string;
	canonical: string;
	image: string;
	imageAlt: string;
	type: 'website' | 'article';
	jsonLd: string;
};

const DEFAULT_DESCRIPTION =
	'Notes from Swapnil on agents, evals, durable workflows, and the systems around them.';

const PAGES: Record<string, { title: string; description: string }> = {
	'/': {
		title: SITE_NAME,
		description: 'Engineering notes on agentic systems, evals, durable workflows, and tooling.'
	},
	'/blog': {
		title: `blog | ${SITE_NAME}`,
		description: 'Incomplete notes, thoughts, and tools.'
	},
	'/about': {
		title: `about | ${SITE_NAME}`,
		description:
			'A living record of work, projects, and research across agents, models, and systems.'
	},
	'/ai': {
		title: `How I Use (and Don't Use) AI | ${SITE_NAME}`,
		description:
			'What on this site is written by hand, and the narrow ways a model is allowed to help after a draft exists.'
	}
};

function normalizePath(pathname: string): string {
	if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1);
	return pathname || '/';
}

function isoDate(date: string): string | undefined {
	const dmy = /^(\d{2})-(\d{2})-(\d{4})$/.exec(date);
	if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
	const parsed = Date.parse(date);
	if (Number.isNaN(parsed)) return undefined;
	return new Date(parsed).toISOString().slice(0, 10);
}

function jsonScript(value: unknown): string {
	return JSON.stringify(value).replace(/</g, '\\u003c');
}

function pageJsonLd(input: {
	title: string;
	description: string;
	canonical: string;
	image: string;
	type: 'website' | 'article';
	datePublished?: string;
}): string {
	if (input.type === 'article') {
		return jsonScript({
			'@context': 'https://schema.org',
			'@type': 'BlogPosting',
			headline: input.title.replace(` | ${SITE_NAME}`, ''),
			description: input.description,
			url: input.canonical,
			mainEntityOfPage: input.canonical,
			datePublished: input.datePublished,
			image: input.image,
			author: {
				'@type': 'Person',
				name: 'Swapnil',
				url: SITE_ORIGIN
			}
		});
	}

	return jsonScript({
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: SITE_NAME,
		url: SITE_ORIGIN,
		description: input.description
	});
}

export function seoFor(pathname: string): PageSeo {
	const path = normalizePath(pathname);
	const image = `${SITE_ORIGIN}${OG_IMAGE_PATH}`;
	const postMatch = /^\/blog\/([^/]+)$/.exec(path);
	const post = postMatch ? getPost(postMatch[1]) : undefined;
	const known = PAGES[path];

	let title =
		known?.title ??
		`${path.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') ?? SITE_NAME} | ${SITE_NAME}`;
	let description = known?.description ?? DEFAULT_DESCRIPTION;
	let type: 'website' | 'article' = 'website';
	let datePublished: string | undefined;

	if (post) {
		title = `${post.title} | ${SITE_NAME}`;
		description = post.excerpt || DEFAULT_DESCRIPTION;
		type = 'article';
		datePublished = isoDate(post.date);
	}

	const canonical = path === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${path}`;

	return {
		title,
		description,
		canonical,
		image,
		imageAlt: OG_IMAGE_ALT,
		type,
		jsonLd: pageJsonLd({ title, description, canonical, image, type, datePublished })
	};
}

export function sitemapXml(): string {
	const paths = ['/', '/blog', '/about', '/ai', ...getPosts().map((post) => `/blog/${post.slug}`)];
	const urls = paths
		.map((path) => {
			const loc = path === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${path}`;
			const post = /^\/blog\/([^/]+)$/.exec(path);
			const lastmod = post ? isoDate(getPost(post[1])?.date ?? '') : undefined;
			const lastmodTag = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : '';
			return `  <url>\n    <loc>${loc}</loc>${lastmodTag}\n  </url>`;
		})
		.join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function llmsTxt(): string {
	const writing = getPosts()
		.map((post) => {
			const blurb = post.excerpt ? `: ${post.excerpt}` : '';
			return `- [${post.title}](${SITE_ORIGIN}/blog/${post.slug})${blurb}`;
		})
		.join('\n');

	return `# swappy

> Personal site of Swapnil. Notes on agents, evals, durable workflows, and tooling. Search and citation are welcome. Model training is not.

Content-Signal: ${CONTENT_SIGNAL}

## Pages

- [Home](${SITE_ORIGIN}/): engineering notes
- [Blog](${SITE_ORIGIN}/blog): notes and writeups
- [About](${SITE_ORIGIN}/about): background and what he is working on
- [How I Use (and Don't Use) AI](${SITE_ORIGIN}/ai): what is written by hand

## Writing

${writing}
`;
}

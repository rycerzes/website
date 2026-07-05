export type Post = {
	title: string;
	slug: string;
	date: string;
	excerpt: string;
	tags: string[];
	cover: string;
	readingTime: string;
	component?: any; // The actual Svelte component
};

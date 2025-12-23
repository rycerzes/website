export type Post = {
    title: string;
    slug: string;
    date: string;
    excerpt: string;
    tags: string[];
    cover: string;
    component?: any; // The actual Svelte component
};

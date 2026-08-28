import type { Component } from 'svelte';

export type Post = {
	title: string;
	slug: string;
	date: string;
	excerpt: string;
	tags: string[];
	cover: string;
	readingTime: string;
	component?: Component; // The actual Svelte component
};

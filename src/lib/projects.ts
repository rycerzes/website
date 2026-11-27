import type { Component } from 'svelte';

export type ProjectLink = { label: string; href: string };

export type Project = {
	slug: string;
	title: string;
	description: string;
	year: string;
	/** YYYY-MM-DD of the latest work; projects sort newest first. */
	date: string;
	featured: boolean;
	/** Short label next to the year: "hackathon" or "uni project". */
	tag?: string;
	links: ProjectLink[];
	/** True when the project page has a write-up below the header. */
	hasBody: boolean;
	component?: Component;
};

type ProjectMetadata = Partial<Omit<Project, 'slug' | 'hasBody' | 'component'>>;
type ProjectModule = { default: Component; metadata?: ProjectMetadata };

const modules = import.meta.glob('/src/projects/*.mdx', { eager: true });
const rawModules = import.meta.glob('/src/projects/*.mdx', {
	eager: true,
	query: '?raw',
	import: 'default'
});

function slugOf(path: string): string {
	return (
		path
			.split('/')
			.pop()
			?.replace(/\.mdx$/, '') ?? ''
	);
}

function hasBody(path: string): boolean {
	const raw = rawModules[path];
	if (typeof raw !== 'string') return false;
	return (
		raw
			.replace(/^---[\s\S]*?---/, '')
			.replace(/<!--[\s\S]*?-->/g, '')
			.trim().length > 0
	);
}

function toProject(path: string, mod: ProjectModule, withComponent: boolean): Project {
	const meta = mod.metadata ?? {};
	return {
		slug: slugOf(path),
		title: meta.title ?? 'Untitled',
		description: meta.description ?? '',
		year: meta.year ?? meta.date?.slice(0, 4) ?? '',
		date: meta.date ?? '',
		featured: meta.featured ?? false,
		tag: meta.tag,
		links: meta.links ?? [],
		hasBody: hasBody(path),
		component: withComponent ? mod.default : undefined
	};
}

export function getProjects(): Project[] {
	return Object.entries(modules)
		.map(([path, mod]) => toProject(path, mod as ProjectModule, false))
		.sort((a, b) => b.date.localeCompare(a.date));
}

export function getFeaturedProjects(): Project[] {
	return getProjects().filter((project) => project.featured);
}

export function getProject(slug: string): Project | undefined {
	for (const [path, mod] of Object.entries(modules)) {
		if (slugOf(path) === slug) return toProject(path, mod as ProjectModule, true);
	}
	return undefined;
}

export function isExternal(href: string): boolean {
	return /^https?:\/\//.test(href);
}

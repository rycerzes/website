import { getProjects } from '$lib/projects';
import { error } from '@sveltejs/kit';
import type { EntryGenerator } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () =>
	getProjects().map((project) => ({ slug: project.slug }));

export function load({ params }) {
	if (!getProjects().some((project) => project.slug === params.slug)) {
		throw error(404, 'Project not found');
	}
	return {};
}

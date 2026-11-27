import { getProjects } from '$lib/projects';

export const prerender = true;

export function load() {
	return {
		projects: getProjects()
	};
}

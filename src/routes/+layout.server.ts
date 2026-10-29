import { seoFor } from '$lib/server/seo';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ url }) => {
	return { seo: seoFor(url.pathname) };
};

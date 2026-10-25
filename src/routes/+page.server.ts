import { env } from '$env/dynamic/public';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders({
		'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
	});

	const fetchLanyardPresence = async (userId: string) => {
		if (!userId) return null;

		try {
			const response = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);

			if (!response.ok) {
				console.error('Failed to fetch Lanyard presence:', await response.text());
				return null;
			}

			const payload = await response.json();
			return payload?.data ?? null;
		} catch (error) {
			console.error('Error fetching Lanyard presence:', error);
			return null;
		}
	};

	try {
		const lanyardUserId = env.PUBLIC_LANYARD_USER_ID?.trim() ?? '';

		const lanyardPresence = await fetchLanyardPresence(lanyardUserId);

		return {
			lanyard: lanyardPresence
		};
	} catch (error) {
		console.error('Error in load function:', error);
		return {
			lanyard: null
		};
	}
};

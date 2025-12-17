import { GITHUB_TOKEN } from '$env/static/private';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    try {
        const response = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${GITHUB_TOKEN}`,
                'User-Agent': 'SvelteKit-App'
            }
        });

        if (!response.ok) {
            console.error('Failed to fetch GitHub user:', await response.text());
            return {
                avatarUrl: 'https://github.com/rycerzes.png'
            };
        }

        const data = await response.json();
        return {
            avatarUrl: data.avatar_url ?? 'https://github.com/rycerzes.png'
        };
    } catch (error) {
        console.error('Error fetching GitHub avatar:', error);
        return {
            avatarUrl: 'https://github.com/rycerzes.png'
        };
    }
};

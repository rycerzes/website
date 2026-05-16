import { GITHUB_TOKEN } from '$env/static/private';
import { env } from '$env/dynamic/public';
import { getPosts } from '$lib/posts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
    setHeaders({
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
    });
    const projectLinks = [
        'meta-pytorch/openenv',
        '3xcaffeine/mario-openenv',
        'cosdata/cosdata'
    ];

    const fetchRepoData = async (repo: string) => {
        try {
            const [repoRes, langRes] = await Promise.all([
                fetch(`https://api.github.com/repos/${repo}`, {
                    headers: {
                        Authorization: `Bearer ${GITHUB_TOKEN}`,
                        'User-Agent': 'SvelteKit-App'
                    }
                }),
                fetch(`https://api.github.com/repos/${repo}/languages`, {
                    headers: {
                        Authorization: `Bearer ${GITHUB_TOKEN}`,
                        'User-Agent': 'SvelteKit-App'
                    }
                })
            ]);

            if (!repoRes.ok || !langRes.ok) {
                console.error(`Failed to fetch data for ${repo}`);
                return null;
            }

            const repoData = await repoRes.json();
            const langData = await langRes.json();

            return {
                full_name: repoData.full_name,
                description: repoData.description,
                languages: Object.keys(langData),
                topics: repoData.topics,
                pushed_at: repoData.pushed_at,
                html_url: repoData.html_url
            };
        } catch (error) {
            console.error(`Error fetching ${repo}:`, error);
            return null;
        }
    };

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

        const [userRes, projectsData, lanyardPresence] = await Promise.all([
            fetch('https://api.github.com/user', {
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                    'User-Agent': 'SvelteKit-App'
                }
            }),
            Promise.all(projectLinks.map(fetchRepoData)),
            fetchLanyardPresence(lanyardUserId)
        ]);

        let avatarUrl = 'https://github.com/rycerzes.png';
        if (userRes.ok) {
            const userData = await userRes.json();
            avatarUrl = userData.avatar_url ?? avatarUrl;
        } else {
            console.error('Failed to fetch GitHub user:', await userRes.text());
        }

        return {
            avatarUrl,
            projects: projectsData.filter((p) => p !== null),
            posts: getPosts().slice(0, 3),
            lanyard: lanyardPresence
        };
    } catch (error) {
        console.error('Error in load function:', error);
        return {
            avatarUrl: 'https://github.com/rycerzes.png',
            projects: [],
            posts: [],
            lanyard: null
        };
    }
};

import { GITHUB_TOKEN } from '$env/static/private';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
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

    try {
        const [userRes, projectsData] = await Promise.all([
            fetch('https://api.github.com/user', {
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                    'User-Agent': 'SvelteKit-App'
                }
            }),
            Promise.all(projectLinks.map(fetchRepoData))
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
            projects: projectsData.filter((p) => p !== null)
        };
    } catch (error) {
        console.error('Error in load function:', error);
        return {
            avatarUrl: 'https://github.com/rycerzes.png',
            projects: []
        };
    }
};

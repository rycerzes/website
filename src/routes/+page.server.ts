import { GITHUB_TOKEN } from '$env/static/private';
import { getPosts } from '$lib/posts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
    setHeaders({
        'Cache-Control': 'public, max-age=86400'
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

    const fetchSpotifyMeta = async (url: string) => {
        try {
            const res = await fetch(url);
            if (!res.ok) return null;
            const html = await res.text();
            // Match: <title>Song - song and lyrics by Artist | Spotify</title>
            const match = html.match(/<title>(.*?) - song and lyrics by (.*?) \| Spotify<\/title>/);
            if (match) {
                return {
                    title: match[1],
                    artist: match[2],
                    url
                };
            }
            // Fallback if title format is different (e.g. just Title | Spotify)
            const simpleMatch = html.match(/<title>(.*?) \| Spotify<\/title>/);
            if (simpleMatch) {
                return {
                    title: simpleMatch[1],
                    artist: 'Spotify',
                    url
                }
            }
            return null;
        } catch (e) {
            console.error('Error fetching Spotify meta:', e);
            return null;
        }
    };

    try {
        const spotifyUrl = 'https://open.spotify.com/track/13mhxEx7vmeGk6e2Zk5gTQ';

        const [userRes, projectsData, recentActivity] = await Promise.all([
            fetch('https://api.github.com/user', {
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                    'User-Agent': 'SvelteKit-App'
                }
            }),
            Promise.all(projectLinks.map(fetchRepoData)),
            fetchSpotifyMeta(spotifyUrl)
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
            recentActivity
        };
    } catch (error) {
        console.error('Error in load function:', error);
        return {
            avatarUrl: 'https://github.com/rycerzes.png',
            projects: [],
            posts: []
        };
    }
};

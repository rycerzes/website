import { execSync } from 'node:child_process';
import tailwindcss from '@tailwindcss/vite';
import devtoolsJson from 'vite-plugin-devtools-json';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

function git(command: string): string {
	try {
		return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
	} catch {
		return '';
	}
}

function commitMeta(): { sha: string; branch: string } {
	const sha =
		process.env.CF_PAGES_COMMIT_SHA ||
		process.env.WORKERS_CI_COMMIT_SHA ||
		process.env.GITHUB_SHA ||
		git('git rev-parse HEAD');

	let branch =
		process.env.CF_PAGES_BRANCH ||
		process.env.WORKERS_CI_BRANCH ||
		process.env.GITHUB_REF_NAME ||
		git('git rev-parse --abbrev-ref HEAD');

	if (!branch || branch === 'HEAD') {
		const named = git('git name-rev --name-only HEAD')
			.replace(/^remotes\/origin\//, '')
			.replace(/^origin\//, '')
			.split('~')[0];
		branch = named || 'main';
	}

	return { sha, branch };
}

const { sha, branch } = commitMeta();

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), devtoolsJson()],
	define: {
		__APP_COMMIT_SHA__: JSON.stringify(sha),
		__APP_COMMIT_BRANCH__: JSON.stringify(branch)
	}
});

import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { execSync } from 'child_process';
import pkg from './package.json';

export default defineConfig({
	plugins: [
		sveltekit(),
		{
			name: 'git-commit-info',
			config() {
				const hash = execSync('git log -1 --pretty=format:"%h"').toString().trim();
				const now = new Date().toLocaleString(undefined, {
					month: 'long',
					day: '2-digit',
					year: 'numeric',
					hour12: false,
					hour: '2-digit',
					minute: '2-digit',
					second: '2-digit',
					weekday: 'long'
				});
				process.env.VITE_GIT_COMMIT_HASH = hash;
				process.env.VITE_BUILD_TIME = now;
				process.env.VITE_APP_VERSION = pkg.version;
			}
		}
	],
	server: {
		headers: {
			'Cache-Control': 'max-age=2592000' // 30 days
		},
		hmr: {
			protocol: 'ws',
			host: 'localhost'
		}
	}
});

import { browser } from '$app/environment';

export type Theme = 'light' | 'dark' | 'system';

class ThemeStore {
	value = $state<Theme>('system');
}

export const themeStore = new ThemeStore();

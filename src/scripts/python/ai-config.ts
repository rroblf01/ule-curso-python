/** The AI server and model chosen by the student, remembered in the browser. */
import { AI_DEFAULTS } from '../../data/ai';

export interface AIConfig {
	server: string;
	model: string;
}

const KEY = 'curso-ia';

/** "https://host/v1/" -> "https://host" */
export function normalizeServer(server: string) {
	return server.trim().replace(/\/+$/, '').replace(/\/v1$/, '');
}

export function loadAIConfig(): AIConfig {
	try {
		const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null');
		if (saved && typeof saved.server === 'string' && typeof saved.model === 'string') return saved;
	} catch {}
	return { ...AI_DEFAULTS };
}

export function saveAIConfig(config: AIConfig) {
	try {
		const isDefault = config.server === AI_DEFAULTS.server && config.model === AI_DEFAULTS.model;
		if (isDefault) localStorage.removeItem(KEY);
		else localStorage.setItem(KEY, JSON.stringify(config));
	} catch {}
}

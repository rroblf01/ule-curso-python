/** "Modelo de IA" panel: choose the Ollama server and model behind `curso.MODELO`. */
import { AI_DEFAULTS } from '../../data/ai';
import { normalizeServer } from './ai-config';
import { runtime } from './runtime';

interface OllamaModelInfo {
	name: string;
	details?: { parameter_size?: string };
}

async function listModels(server: string): Promise<OllamaModelInfo[]> {
	const response = await fetch(`${server}/api/tags`, { signal: AbortSignal.timeout(6000) });
	if (!response.ok) throw new Error(`HTTP ${response.status}`);
	return (await response.json()).models ?? [];
}

export function mountAiPanel(panel: HTMLElement, signal: AbortSignal) {
	const serverInput = panel.querySelector<HTMLInputElement>('[data-ai-server]')!;
	const modelSelect = panel.querySelector<HTMLSelectElement>('[data-ai-model]')!;
	const refreshButton = panel.querySelector<HTMLButtonElement>('[data-ai-refresh]')!;
	const resetButton = panel.querySelector<HTMLButtonElement>('[data-ai-reset]')!;
	const message = panel.querySelector<HTMLElement>('[data-ai-msg]')!;

	const say = (text: string, state: 'ok' | 'error' | '' = '') => {
		message.textContent = text;
		message.dataset.state = state;
	};

	const showReset = () => {
		const { server, model } = runtime.currentAIConfig;
		resetButton.hidden = server === AI_DEFAULTS.server && model === AI_DEFAULTS.model;
	};

	function fillModels(models: OllamaModelInfo[], selected: string) {
		modelSelect.replaceChildren();
		const names = models.map((model) => model.name);
		if (!names.includes(selected)) names.unshift(selected);
		for (const name of names) {
			const info = models.find((model) => model.name === name);
			const option = new Option(
				info ? `${name}${info.details?.parameter_size ? ` · ${info.details.parameter_size}` : ''}` : `${name} (no está en el servidor)`,
				name,
			);
			option.selected = name === selected;
			modelSelect.append(option);
		}
	}

	/** Ask the server for its models; switch to the first one if the current one is not there. */
	async function connect(apply: boolean) {
		const server = normalizeServer(serverInput.value) || AI_DEFAULTS.server;
		serverInput.value = server;
		say('Consultando el servidor…');
		let model = runtime.currentAIConfig.model;
		let reachable = true;
		try {
			const models = await listModels(server);
			if (signal.aborted) return;
			if (models.length && !models.some((info) => info.name === model)) model = models[0].name;
			fillModels(models, model);
			say(`✓ Conectado · ${models.length} modelo${models.length === 1 ? '' : 's'} disponible${models.length === 1 ? '' : 's'}`, 'ok');
		} catch {
			if (signal.aborted) return;
			fillModels([], model);
			reachable = false;
		}
		if (apply) await use({ server, model });
		// Still switch to it (it may come up later), but keep the warning visible.
		if (!reachable) say('✗ No responde. Revisa la URL y que el servidor permita esta web (OLLAMA_ORIGINS).', 'error');
	}

	async function use(config: { server: string; model: string }) {
		const current = runtime.currentAIConfig;
		if (current.server !== config.server || current.model !== config.model) {
			await runtime.configureAI(config);
			say(`Usando ${config.model}. Los agentes ya creados también cambian.`, 'ok');
		}
		showReset();
	}

	const { server, model } = runtime.currentAIConfig;
	serverInput.value = server;
	fillModels([], model);
	showReset();
	connect(false);

	// Also reflect changes made from code with curso.configurar().
	runtime.addEventListener(
		'ai-config',
		(event) => {
			const config = (event as CustomEvent<{ server: string; model: string }>).detail;
			const serverChanged = normalizeServer(serverInput.value) !== config.server;
			serverInput.value = config.server;
			if (serverChanged) connect(false);
			else if (modelSelect.value !== config.model) {
				const options = [...modelSelect.options].map((option) => option.value);
				if (!options.includes(config.model)) modelSelect.append(new Option(config.model, config.model));
				modelSelect.value = config.model;
			}
			say(`Usando ${config.model}.`, 'ok');
			showReset();
		},
		{ signal },
	);

	serverInput.addEventListener('change', () => connect(true), { signal });
	serverInput.addEventListener(
		'keydown',
		(event) => {
			if (event.key === 'Enter') {
				event.preventDefault();
				serverInput.blur();
			}
		},
		{ signal },
	);
	refreshButton.addEventListener('click', () => connect(true), { signal });
	modelSelect.addEventListener('change', () => use({ server: normalizeServer(serverInput.value), model: modelSelect.value }), {
		signal,
	});
	resetButton.addEventListener(
		'click',
		async () => {
			serverInput.value = AI_DEFAULTS.server;
			await runtime.configureAI({ ...AI_DEFAULTS });
			await connect(false);
			showReset();
		},
		{ signal },
	);
}

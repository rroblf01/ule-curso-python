import { Playground } from './playground';
import { runtime, type RuntimeStatus } from './runtime';

const RUNNABLE = 'pre[data-language="python"]:not([data-meta~="static"])';
const mounted = new WeakMap<HTMLElement, Playground[]>();

/** Turn every runnable Python block of a lesson into an editor (only once). */
export function mountPlaygrounds(lesson: HTMLElement) {
	if (mounted.has(lesson) || !lesson.hasAttribute('data-runnable')) return;
	const blocks: Playground[] = [];
	mounted.set(lesson, blocks);
	const sources = [...lesson.querySelectorAll<HTMLElement>(RUNNABLE)];
	sources.forEach((source, index) => {
		const position = index;
		blocks.push(
			new Playground(source, {
				id: `${location.pathname}#${lesson.dataset.lesson}:${index}`,
				previous: () => blocks.slice(0, position),
			}),
		);
	});
}

export function isRunnableBlock(pre: Element) {
	return pre.matches(RUNNABLE) && pre.closest('[data-runnable]') !== null;
}

const LABELS: Record<RuntimeStatus, string> = {
	idle: 'Sin cargar. Se cargará al usar un editor.',
	loading: 'Cargando Python…',
	ready: 'Listo',
	busy: 'Ejecutando…',
	error: 'Error al cargar',
	unsupported: 'No disponible en este navegador',
};

/** Small status panel: shows whether Python is loaded and lets students reset it. */
export function mountStatusPanel(panel: HTMLElement) {
	const label = panel.querySelector<HTMLElement>('[data-status-label]')!;
	const dot = panel.querySelector<HTMLElement>('[data-status-dot]')!;
	const load = panel.querySelector<HTMLButtonElement>('[data-action="load"]')!;
	const reset = panel.querySelector<HTMLButtonElement>('[data-action="reset"]')!;

	const render = () => {
		const { status, message } = runtime;
		dot.dataset.state = status;
		label.textContent = status === 'error' || status === 'unsupported' ? message : LABELS[status];
		load.hidden = status !== 'idle' && status !== 'error';
		reset.hidden = status !== 'ready' && status !== 'busy';
	};

	runtime.addEventListener('status', render);
	runtime.addEventListener('reset', () => {
		label.textContent = 'Variables borradas';
		setTimeout(render, 1500);
	});
	load.addEventListener('click', () => runtime.start().catch(() => {}));
	reset.addEventListener('click', () => runtime.reset());
	if (!runtime.supported) {
		runtime.start().catch(() => {});
	}
	render();
}

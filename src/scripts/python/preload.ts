/**
 * Start loading Python as soon as the page has finished loading, without
 * competing with the page itself: on pages with editors the interpreter boots
 * in the background; on the other pages the files are only downloaded into
 * the browser cache, so the first editor the student opens starts quickly.
 */
import { PYSCRIPT_BASE, RUNNER_URL } from './assets';

function whenIdle(task: () => void) {
	const schedule = () =>
		'requestIdleCallback' in window ? requestIdleCallback(task, { timeout: 3000 }) : setTimeout(task, 1000);
	if (document.readyState === 'complete') schedule();
	else addEventListener('load', schedule, { once: true });
}

/** Respect the "data saver" setting: then Python only loads when an editor is used. */
function saveData() {
	const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
	return connection?.saveData === true;
}

export function preloadPython(boot?: () => Promise<unknown>) {
	if (saveData() || !window.crossOriginIsolated) return;
	whenIdle(async () => {
		if (boot) {
			boot().catch(() => {});
			return;
		}
		try {
			const files: string[] = await (await fetch(`${PYSCRIPT_BASE}preload.json`)).json();
			for (const file of [...files.map((file) => PYSCRIPT_BASE + file), RUNNER_URL]) {
				await fetch(file, { priority: 'low' } as RequestInit).then((response) => response.arrayBuffer());
			}
		} catch {}
	});
}

/**
 * Start Python as soon as the visitor enters the site, in the background, and
 * then load the heavier packages (Pydantic, Pydantic AI). Thanks to the
 * client-side router the worker then stays alive while the student moves between
 * pages, so pressing "Ejecutar" is instant, even for the first AI block.
 */
import { PRELOAD } from '../../data/preload';
import { runtime } from './runtime';

/** Respect the "data saver" setting: then Python only loads when an editor is used. */
function saveData() {
	const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
	return connection?.saveData === true;
}

export function startPythonSoon() {
	// Without cross-origin isolation mini-coi is about to reload the page.
	if (saveData() || !window.crossOriginIsolated) return;
	// Deferred: let the page render first, then boot the worker and load the packages.
	setTimeout(() => runtime.preload(PRELOAD.packages, PRELOAD.modules).catch(() => {}), 0);
}

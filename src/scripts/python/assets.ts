/**
 * Locations of the self-hosted PyScript and Pyodide files
 * (copied to public/vendor/ by `npm run vendor:pyscript`).
 */
import { pyscript } from '../../../package.json';

export const PYSCRIPT_BASE = `/vendor/pyscript/${pyscript.version}/`;
export const PYSCRIPT_URL = `${PYSCRIPT_BASE}core.js`;
export const PYODIDE_URL = `${PYSCRIPT_BASE}pyodide/pyodide.mjs`;
export const RUNNER_URL = '/python/runner.py';

/**
 * A single Python interpreter (PyScript + Pyodide in a web worker) shared by
 * every editor of the page, so variables persist between blocks like in a
 * notebook.
 */

import { PYODIDE_URL, PYSCRIPT_URL, RUNNER_URL } from './assets';

const LOAD_TIMEOUT_MS = 90_000;
const HARD_STOP_AFTER_MS = 3_000;
/** How long the worker has to accept a cancellation before we fall back to Ctrl+C. */
const CANCEL_ANSWER_MS = 300;

export type RuntimeStatus = 'idle' | 'loading' | 'ready' | 'busy' | 'error' | 'unsupported';

export interface RunHandlers {
	write: (stream: 'stdout' | 'stderr' | 'result', text: string) => void;
	ask: (prompt: string) => Promise<string | null>;
	/** Progress messages, such as packages being loaded. */
	status?: (text: string) => void;
}

export interface PythonError {
	type: string;
	summary: string;
	traceback: string;
	hint: string | null;
	line: number | null;
	col: number | null;
}

export interface RunResult {
	status: 'ok' | 'error' | 'interrupted' | 'exit' | 'restarted';
	error: PythonError | null;
}

export interface SyntaxProblem {
	line: number;
	col: number | null;
	end_line: number | null;
	end_col: number | null;
	summary: string;
	hint: string | null;
}

export interface JediCompletion {
	name: string;
	type: string;
	full_name: string;
}

export interface JediSignature {
	name: string;
	full_name: string;
	params: string[];
	index: number | null;
	doc: string;
}

export interface JediDescription {
	name: string;
	full_name: string;
	type: string;
	signature: string;
	doc: string;
}

interface XWorker {
	sync: Record<string, (...args: any[]) => any>;
	terminate: () => void;
}

let pyscriptLoaded: Promise<void> | null = null;

/**
 * Add an element directly under <html>, outside <head> and <body>. Astro's
 * ClientRouter replaces <body> (and prunes <head>) on every navigation: a
 * PyScript <script> removed while Python is still booting never reports that it
 * is ready, so navigating during the first seconds left Python "loading" forever.
 */
function outsidePageContent(element: HTMLElement) {
	document.documentElement.append(element);
}

/**
 * Load PyScript core with a <script type="module"> tag. It cannot be an import()
 * from our own code: the files live in public/, which Vite refuses to serve as
 * source modules during development.
 */
function loadPyScript() {
	pyscriptLoaded ??= new Promise<void>((resolve, reject) => {
		const script = document.createElement('script');
		script.type = 'module';
		script.src = PYSCRIPT_URL;
		script.addEventListener('load', () => resolve(), { once: true });
		script.addEventListener(
			'error',
			() => {
				pyscriptLoaded = null;
				script.remove();
				reject(new Error(`no se ha podido descargar ${PYSCRIPT_URL}`));
			},
			{ once: true },
		);
		outsidePageContent(script);
	});
	return pyscriptLoaded;
}

class PythonRuntime extends EventTarget {
	status: RuntimeStatus = 'idle';
	message = '';
	private worker: XWorker | null = null;
	private starting: Promise<void> | null = null;
	private interrupt: Uint8Array | null = null;
	private handlers: RunHandlers | null = null;
	private pendingAsk: ((value: string | null) => void) | null = null;
	private queue: Promise<unknown> = Promise.resolve();
	private running = false;
	private toolBusy = false;
	private jediReady = false;
	private warming: Promise<unknown> | null = null;
	private preloading: Promise<void> | null = null;
	/** Blocks waiting to run (Python still booting or another block running). */
	private waitingRuns = 0;
	private lastRunEnd = 0;
	private hardStop: ReturnType<typeof setTimeout> | null = null;
	private restartResolve: ((result: RunResult) => void) | null = null;

	get supported() {
		return typeof window !== 'undefined' && window.crossOriginIsolated === true;
	}

	get isRunning() {
		return this.running;
	}

	private setStatus(status: RuntimeStatus, message = '') {
		this.status = status;
		this.message = message;
		this.dispatchEvent(new CustomEvent('status', { detail: { status, message } }));
	}

	/** Load PyScript and the worker. Safe to call many times. */
	start(): Promise<void> {
		if (this.starting) return this.starting;
		if (!this.supported) {
			this.setStatus(
				'unsupported',
				'Este navegador no permite ejecutar Python aquí (falta el aislamiento entre orígenes). Prueba a recargar la página o usa Google Colab.',
			);
			return Promise.reject(new Error(this.message));
		}
		this.starting = this.boot().catch((error) => {
			this.starting = null;
			this.setStatus('error', `No se ha podido cargar Python: ${error?.message ?? error}`);
			throw error;
		});
		return this.starting;
	}

	private async boot() {
		this.setStatus('loading', 'Descargando Python…');
		await loadPyScript();

		const script = document.createElement('script');
		script.type = 'py';
		script.setAttribute('worker', '');
		script.setAttribute('config', JSON.stringify({ interpreter: PYODIDE_URL }));
		script.src = RUNNER_URL;
		script.hidden = true;

		const done = new Promise<void>((resolve, reject) => {
			const timer = setTimeout(() => reject(new Error('tiempo de espera agotado')), LOAD_TIMEOUT_MS);
			script.addEventListener(
				'py:done',
				() => {
					clearTimeout(timer);
					resolve();
				},
				{ once: true },
			);
		});
		outsidePageContent(script);
		await done;

		const worker = (script as unknown as { xworker: XWorker }).xworker;
		worker.sync.write = (stream: unknown, text: unknown) => {
			this.handlers?.write(stream as 'stdout' | 'stderr' | 'result', String(text));
		};
		worker.sync.status = (text: unknown) => {
			this.handlers?.status?.(String(text));
		};
		worker.sync.ask = (prompt: unknown) =>
			new Promise<string | null>((resolve) => {
				if (!this.handlers) return resolve(null);
				this.pendingAsk = resolve;
				this.handlers.ask(String(prompt)).then((value) => {
					this.pendingAsk = null;
					resolve(value);
				});
			});

		this.interrupt = new Uint8Array(new SharedArrayBuffer(1));
		await worker.sync.set_interrupt_buffer(this.interrupt);
		this.worker = worker;
		script.remove();
		this.setStatus('ready');

	}

	/**
	 * Load jedi (autocompletion). It is not loaded in the background on purpose:
	 * it would keep the worker busy for about a second and delay "Ejecutar".
	 * Instead it loads when the student focuses an editor or asks for help.
	 */
	private loadJedi() {
		if (!this.warming && this.worker) {
			const worker = this.worker;
			this.warming = this.exclusive(async () => {
				await worker.sync.warmup();
				this.jediReady = true;
			}).catch(() => {
				this.warming = null;
			});
		}
		return this.warming;
	}

	private exclusive<T>(task: () => Promise<T>): Promise<T> {
		const next = this.queue.then(task, task);
		this.queue = next.catch(() => {});
		return next;
	}

	/** Run a block of code. Blocks are queued and run one after another. */
	async run(code: string, handlers: RunHandlers): Promise<RunResult> {
		this.waitingRuns++;
		try {
			await this.start();
		} catch (error) {
			this.waitingRuns = Math.max(0, this.waitingRuns - 1);
			throw error;
		}
		return this.exclusive(async () => {
			this.waitingRuns = Math.max(0, this.waitingRuns - 1);
			const worker = this.worker!;
			this.handlers = handlers;
			this.running = true;
			this.interrupt![0] = 0;
			this.setStatus('busy', 'Ejecutando…');
			try {
				const result = await Promise.race([
					worker.sync.run(code).then((json: string) => JSON.parse(json) as RunResult),
					new Promise<RunResult>((resolve) => (this.restartResolve = resolve)),
				]);
				return result;
			} finally {
				if (this.hardStop) clearTimeout(this.hardStop);
				this.hardStop = null;
				this.restartResolve = null;
				this.handlers = null;
				this.pendingAsk = null;
				this.running = false;
				this.lastRunEnd = performance.now();
				if (this.status === 'busy') this.setStatus('ready');
			}
		});
	}

	/** Stop the running block (like Ctrl+C). Restarts Python if it does not respond. */
	stop() {
		if (!this.running || !this.interrupt) return;
		if (this.pendingAsk) {
			// Waiting for input(): answering None makes input() raise KeyboardInterrupt.
			this.dispatchEvent(new Event('stopping'));
			this.pendingAsk(null);
		} else {
			// Code waiting on `await` (e.g. a model response) runs no bytecode, so Ctrl+C cannot reach
			// it: cancel its task instead. The worker answers at once only if it is waiting (it is free
			// then; this call is not queued). If it is busy computing, it cannot answer: send Ctrl+C.
			// Never both: a Ctrl+C in the middle of the cancellation would break the library's cleanup.
			const interrupt = this.interrupt;
			let answered = false;
			this.worker?.sync
				.cancel()
				.then(() => (answered = true))
				.catch(() => {});
			setTimeout(() => {
				if (!answered && this.running) interrupt[0] = 2; // SIGINT -> KeyboardInterrupt
			}, CANCEL_ANSWER_MS);
		}
		if (this.hardStop) return;
		this.hardStop = setTimeout(() => this.restart(), HARD_STOP_AFTER_MS);
	}

	/** Kill the worker and start a fresh interpreter (all variables are lost). */
	private restart() {
		this.worker?.terminate();
		this.worker = null;
		this.starting = null;
		this.jediReady = false;
		this.warming = null;
		this.preloading = null;
		this.waitingRuns = 0;
		this.queue = Promise.resolve();
		this.restartResolve?.({ status: 'restarted', error: null });
		this.dispatchEvent(new Event('restarted'));
		this.setStatus('idle');
		this.start().catch(() => {});
	}

	/** Forget every variable defined so far. */
	async reset() {
		if (!this.worker) return;
		if (this.running) this.stop();
		await this.exclusive(() => this.worker!.sync.reset());
		this.dispatchEvent(new Event('reset'));
	}

	/** Run an editor helper only when Python is idle; otherwise return null right away. */
	private tool<T>(task: () => Promise<T>): Promise<T | null> {
		if (!this.worker || this.running || this.toolBusy) return Promise.resolve(null);
		this.toolBusy = true;
		return this.exclusive(task).finally(() => {
			this.toolBusy = false;
		});
	}

	get canAssist() {
		return Boolean(this.worker) && this.jediReady && !this.running && !this.toolBusy;
	}

	/**
	 * Load packages and import modules in the background, so that the first block
	 * that uses them runs at once, and then jedi (autocompletion). It goes in small
	 * steps (load a package, import a module) and only while the student is not
	 * running blocks: each step waits until no block is waiting and none has run for
	 * a moment, since a step cannot be interrupted (importing pydantic_ai takes ~2 s).
	 * Calling it again returns the same promise.
	 */
	preload(packages: string[], modules: string[]): Promise<void> {
		this.preloading ??= (async () => {
			await this.start();
			const steps = [
				...packages.map((name) => () => this.worker!.sync.preload([name], [])),
				...modules.map((name) => () => this.worker!.sync.preload([], [name])),
			];
			for (const step of steps) {
				await this.whenStudentIsIdle();
				await this.exclusive(step);
			}
			await this.whenStudentIsIdle();
			await this.loadJedi();
		})().catch((error) => {
			this.preloading = null;
			throw error;
		});
		return this.preloading;
	}

	private async whenStudentIsIdle(quietMs = 1500) {
		const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
		while (this.waitingRuns > 0 || this.running || performance.now() - this.lastRunEnd < quietMs) await sleep(200);
	}

	/** The student is about to type in an editor: get autocompletion ready if Python is idle. */
	prepareAssist() {
		if (this.worker && !this.running && !this.jediReady) this.loadJedi();
	}

	/** Like canAssist, but if jedi is not loaded yet, load it now and wait a little for it. */
	private async assistReady(waitMs = 3000) {
		if (!this.worker || this.running) return false;
		if (!this.jediReady) {
			const loading = this.loadJedi();
			await Promise.race([loading, new Promise((resolve) => setTimeout(resolve, waitMs))]);
		}
		return this.canAssist;
	}

	async check(code: string): Promise<SyntaxProblem | null> {
		if (!this.worker || this.running) return null;
		// Unlike the other helpers, wait for our turn instead of skipping: it is cheap and important.
		const json: string | null = await this.exclusive(() =>
			this.worker && !this.running ? this.worker.sync.check(code) : null,
		);
		return json ? JSON.parse(json) : null;
	}

	async complete(code: string, line: number, col: number): Promise<JediCompletion[] | null> {
		if (!(await this.assistReady())) return null;
		const json = await this.tool<string>(() => this.worker!.sync.complete(code, line, col));
		return json ? JSON.parse(json) : null;
	}

	async completionDoc(name: string): Promise<{ signature: string; doc: string } | null> {
		if (!this.canAssist) return null;
		const json = await this.tool<string>(() => this.worker!.sync.completion_doc(name));
		return json ? JSON.parse(json) : null;
	}

	async signatures(code: string, line: number, col: number): Promise<JediSignature | null> {
		if (!(await this.assistReady())) return null;
		const json = await this.tool<string>(() => this.worker!.sync.signatures(code, line, col));
		return json ? JSON.parse(json) : null;
	}

	async describe(code: string, line: number, col: number): Promise<JediDescription | null> {
		if (!(await this.assistReady())) return null;
		const json = await this.tool<string>(() => this.worker!.sync.describe(code, line, col));
		return json ? JSON.parse(json) : null;
	}
}

export const runtime = new PythonRuntime();

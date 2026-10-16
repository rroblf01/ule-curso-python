/**
 * A single Python interpreter (PyScript + Pyodide in a web worker) shared by
 * every editor of the page, so variables persist between blocks like in a
 * notebook.
 */

const PYSCRIPT_VERSION = '2026.7.3';
const PYSCRIPT_URL = `https://pyscript.net/releases/${PYSCRIPT_VERSION}/core.js`;
const RUNNER_URL = '/python/runner.py';
const LOAD_TIMEOUT_MS = 90_000;
const HARD_STOP_AFTER_MS = 3_000;

export type RuntimeStatus = 'idle' | 'loading' | 'ready' | 'busy' | 'error' | 'unsupported';

export interface RunHandlers {
	write: (stream: 'stdout' | 'stderr' | 'result', text: string) => void;
	ask: (prompt: string) => Promise<string | null>;
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
		await import(/* @vite-ignore */ PYSCRIPT_URL);

		const script = document.createElement('script');
		script.type = 'py';
		script.setAttribute('worker', '');
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
		document.body.append(script);
		await done;

		const worker = (script as unknown as { xworker: XWorker }).xworker;
		worker.sync.write = (stream: unknown, text: unknown) => {
			this.handlers?.write(stream as 'stdout' | 'stderr' | 'result', String(text));
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

		// Load jedi in the background so autocompletion is ready when needed.
		this.tool(async () => {
			await worker.sync.warmup();
			this.jediReady = true;
		}).catch(() => {});
	}

	private exclusive<T>(task: () => Promise<T>): Promise<T> {
		const next = this.queue.then(task, task);
		this.queue = next.catch(() => {});
		return next;
	}

	/** Run a block of code. Blocks are queued and run one after another. */
	async run(code: string, handlers: RunHandlers): Promise<RunResult> {
		await this.start();
		return this.exclusive(async () => {
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
			this.interrupt[0] = 2; // SIGINT -> KeyboardInterrupt
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

	async check(code: string): Promise<SyntaxProblem | null> {
		if (!this.worker || this.running) return null;
		// Unlike the other helpers, wait for our turn instead of skipping: it is cheap and important.
		const json: string | null = await this.exclusive(() =>
			this.worker && !this.running ? this.worker.sync.check(code) : null,
		);
		return json ? JSON.parse(json) : null;
	}

	async complete(code: string, line: number, col: number): Promise<JediCompletion[] | null> {
		if (!this.canAssist) return null;
		const json = await this.tool<string>(() => this.worker!.sync.complete(code, line, col));
		return json ? JSON.parse(json) : null;
	}

	async completionDoc(name: string): Promise<{ signature: string; doc: string } | null> {
		if (!this.canAssist) return null;
		const json = await this.tool<string>(() => this.worker!.sync.completion_doc(name));
		return json ? JSON.parse(json) : null;
	}

	async signatures(code: string, line: number, col: number): Promise<JediSignature | null> {
		if (!this.canAssist) return null;
		const json = await this.tool<string>(() => this.worker!.sync.signatures(code, line, col));
		return json ? JSON.parse(json) : null;
	}

	async describe(code: string, line: number, col: number): Promise<JediDescription | null> {
		if (!this.canAssist) return null;
		const json = await this.tool<string>(() => this.worker!.sync.describe(code, line, col));
		return json ? JSON.parse(json) : null;
	}
}

export const runtime = new PythonRuntime();

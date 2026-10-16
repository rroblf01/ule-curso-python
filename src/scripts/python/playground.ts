/**
 * An editable, runnable Python block: CodeMirror editor + toolbar + output.
 */
import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { python } from '@codemirror/lang-python';
import { bracketMatching, HighlightStyle, indentOnInput, indentUnit, syntaxHighlighting } from '@codemirror/language';
import { type Diagnostic, lintGutter, setDiagnostics } from '@codemirror/lint';
import { EditorState, type Extension } from '@codemirror/state';
import {
	drawSelection,
	EditorView,
	highlightActiveLine,
	highlightActiveLineGutter,
	keymap,
	lineNumbers,
	placeholder,
} from '@codemirror/view';
import { tags } from '@lezer/highlight';
import { pythonCompletions, pythonHover, richText, signatureHints, syntaxLinter } from './assist';
import { type PythonError, type RunResult, runtime } from './runtime';

const MAX_OUTPUT_CHARS = 200_000;

const highlight = HighlightStyle.define([
	{ tag: [tags.keyword, tags.controlKeyword, tags.definitionKeyword, tags.moduleKeyword, tags.operatorKeyword], color: 'var(--tok-keyword)' },
	{ tag: [tags.string, tags.special(tags.string)], color: 'var(--tok-string)' },
	{ tag: [tags.number, tags.bool, tags.null], color: 'var(--tok-number)' },
	{ tag: tags.comment, color: 'var(--tok-comment)', fontStyle: 'italic' },
	{ tag: [tags.function(tags.variableName), tags.function(tags.definition(tags.variableName))], color: 'var(--tok-function)' },
	{ tag: [tags.className, tags.definition(tags.className)], color: 'var(--tok-class)' },
	{ tag: [tags.self, tags.special(tags.variableName)], color: 'var(--tok-self)' },
	{ tag: tags.propertyName, color: 'var(--tok-property)' },
	{ tag: [tags.operator, tags.compareOperator, tags.arithmeticOperator], color: 'var(--tok-operator)' },
]);

const theme = EditorView.theme({
	'&': {
		backgroundColor: 'var(--code-bg)',
		color: 'var(--text)',
		fontSize: '0.9rem',
	},
	'&.cm-focused': { outline: 'none' },
	'.cm-scroller': { fontFamily: 'var(--mono)', lineHeight: '1.55' },
	'.cm-content': { padding: '12px 0', caretColor: 'var(--accent)' },
	'.cm-line': { padding: '0 14px 0 6px' },
	'.cm-gutters': {
		backgroundColor: 'var(--code-bg)',
		color: 'var(--muted)',
		border: 'none',
		opacity: '0.75',
	},
	'.cm-activeLine': { backgroundColor: 'var(--active-line)' },
	'.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--text)' },
	'.cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection': {
		backgroundColor: 'var(--selection) !important',
	},
	'.cm-cursor': { borderLeftColor: 'var(--accent)', borderLeftWidth: '2px' },
	'.cm-matchingBracket': { backgroundColor: 'var(--selection)', outline: '1px solid var(--accent)' },
	'.cm-placeholder': { color: 'var(--muted)', fontStyle: 'italic' },
	'.cm-tooltip': {
		backgroundColor: 'var(--surface)',
		color: 'var(--text)',
		border: '1px solid var(--border)',
		borderRadius: '8px',
		boxShadow: '0 8px 24px rgba(0,0,0,.15)',
		fontFamily: 'var(--font)',
		maxWidth: 'min(460px, 90vw)',
	},
	'.cm-tooltip-autocomplete > ul': { fontFamily: 'var(--mono)', maxHeight: '15em' },
	'.cm-tooltip-autocomplete > ul > li': { padding: '3px 10px !important' },
	'.cm-tooltip-autocomplete > ul > li[aria-selected]': {
		backgroundColor: 'var(--accent)',
		color: 'var(--accent-contrast)',
	},
	'.cm-completionDetail': { fontFamily: 'var(--font)', fontStyle: 'normal', opacity: '0.7', marginLeft: '0.8em' },
	'.cm-completionMatchedText': { textDecoration: 'none', fontWeight: '700' },
	'.cm-completionInfo': { padding: '10px 12px' },
	'.cm-diagnostic': { whiteSpace: 'pre-wrap', fontFamily: 'var(--font)', padding: '8px 12px', maxWidth: '440px' },
	'.cm-diagnostic-error': { borderLeft: '4px solid var(--error)' },
	'.cm-lintRange-error': {
		backgroundImage: 'none',
		textDecoration: 'underline wavy var(--error)',
		textUnderlineOffset: '3px',
	},
	'.cm-lint-marker': { width: '0.9em', height: '0.9em' },
});

function hash(text: string) {
	let h = 0;
	for (let i = 0; i < text.length; i++) h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
	return (h >>> 0).toString(36);
}

function storageGet(key: string) {
	try {
		return localStorage.getItem(key);
	} catch {
		return null;
	}
}

function storageSet(key: string, value: string | null) {
	try {
		if (value === null) localStorage.removeItem(key);
		else localStorage.setItem(key, value);
	} catch {}
}

function button(label: string, title: string, className: string, icon: string) {
	const element = document.createElement('button');
	element.type = 'button';
	element.className = `pg-btn ${className}`;
	element.title = title;
	element.setAttribute('aria-label', title);
	element.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">${icon}</svg>`;
	if (label) {
		const span = document.createElement('span');
		span.textContent = label;
		element.append(span);
	}
	return element;
}

const ICONS = {
	run: '<path fill="currentColor" d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z"/>',
	stop: '<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>',
	reset: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M4 4v6h6M4.5 15a8 8 0 1 0 1.9-8.3L4 10"/>',
	copy: '<rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path fill="none" stroke="currentColor" stroke-width="2" d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
};

export interface PlaygroundOptions {
	/** Unique and stable id, used to remember the student's edits. */
	id: string;
	/** Blocks that come before this one in the same lesson. */
	previous: () => Playground[];
}

export class Playground {
	readonly root: HTMLElement;
	readonly view: EditorView;
	private readonly original: string;
	private readonly storageKey: string;
	private readonly output: HTMLElement;
	private readonly status: HTMLElement;
	private readonly runButton: HTMLButtonElement;
	private readonly stopButton: HTMLButtonElement;
	private readonly resetButton: HTMLButtonElement;
	private outputChars = 0;
	private truncated = false;
	private lastStream: { name: string; node: HTMLElement } | null = null;
	private saveTimer: ReturnType<typeof setTimeout> | null = null;

	constructor(
		source: HTMLElement,
		private readonly options: PlaygroundOptions,
	) {
		this.original = (source.querySelector('code') ?? source).textContent!.replace(/\n$/, '');
		this.storageKey = `pg:${options.id}:${hash(this.original)}`;
		const saved = storageGet(this.storageKey);

		this.root = document.createElement('div');
		this.root.className = 'pg';

		const editorHost = document.createElement('div');
		editorHost.className = 'pg-editor';

		const bar = document.createElement('div');
		bar.className = 'pg-bar';
		this.runButton = button('Ejecutar', 'Ejecutar (Ctrl+Enter)', 'pg-run', ICONS.run);
		this.stopButton = button('Detener', 'Detener la ejecución', 'pg-stop', ICONS.stop);
		this.stopButton.hidden = true;
		this.status = document.createElement('span');
		this.status.className = 'pg-status';
		this.status.setAttribute('role', 'status');
		this.resetButton = button('', 'Restaurar el código original', 'pg-icon', ICONS.reset);
		const copyButton = button('', 'Copiar el código', 'pg-icon', ICONS.copy);
		bar.append(this.runButton, this.stopButton, this.status, this.resetButton, copyButton);

		this.output = document.createElement('div');
		this.output.className = 'pg-output';
		this.output.hidden = true;
		this.output.setAttribute('aria-live', 'polite');

		this.root.append(editorHost, bar, this.output);
		source.replaceWith(this.root);

		this.view = new EditorView({
			parent: editorHost,
			state: EditorState.create({
				doc: saved ?? this.original,
				extensions: this.extensions(),
			}),
		});

		this.runButton.addEventListener('click', () => this.run());
		this.stopButton.addEventListener('click', () => runtime.stop());
		this.resetButton.addEventListener('click', () => this.restore());
		copyButton.addEventListener('click', async () => {
			try {
				await navigator.clipboard.writeText(this.code);
				this.flash('Copiado');
			} catch {
				this.flash('No se ha podido copiar');
			}
		});
		this.updateEdited();
	}

	get code() {
		return this.view.state.doc.toString();
	}

	private extensions(): Extension[] {
		return [
			lineNumbers(),
			highlightActiveLineGutter(),
			highlightActiveLine(),
			history(),
			drawSelection(),
			indentOnInput(),
			indentUnit.of('    '),
			EditorState.tabSize.of(4),
			bracketMatching(),
			closeBrackets(),
			python(),
			syntaxHighlighting(highlight),
			theme,
			placeholder('Escribe aquí tu código…'),
			autocompletion({
				override: [pythonCompletions],
				activateOnTyping: true,
				icons: true,
				closeOnBlur: true,
			}),
			pythonHover,
			signatureHints,
			syntaxLinter,
			lintGutter(),
			keymap.of([
				{ key: 'Mod-Enter', run: () => (this.run(), true) },
				{ key: 'Shift-Enter', run: () => (this.run(), true) },
				...closeBracketsKeymap,
				...completionKeymap,
				...defaultKeymap,
				...historyKeymap,
				indentWithTab,
			]),
			EditorView.contentAttributes.of({ 'aria-label': 'Editor de código Python' }),
			EditorView.updateListener.of((update) => {
				if (update.focusChanged && update.view.hasFocus) {
					runtime
						.start()
						.then(() => runtime.prepareAssist())
						.catch(() => {});
				}
				if (update.docChanged) this.scheduleSave();
			}),
		];
	}

	private scheduleSave() {
		if (this.saveTimer) clearTimeout(this.saveTimer);
		this.saveTimer = setTimeout(() => {
			storageSet(this.storageKey, this.code === this.original ? null : this.code);
			this.updateEdited();
		}, 400);
	}

	private updateEdited() {
		this.root.classList.toggle('pg-edited', this.code !== this.original);
	}

	private restore() {
		this.view.dispatch({ changes: { from: 0, to: this.view.state.doc.length, insert: this.original } });
		storageSet(this.storageKey, null);
		this.updateEdited();
		this.clearOutput();
		this.view.focus();
	}

	private flash(text: string) {
		const previous = this.status.textContent;
		this.status.textContent = text;
		setTimeout(() => {
			if (this.status.textContent === text) this.status.textContent = previous;
		}, 1500);
	}

	// ----- output -------------------------------------------------------------

	private clearOutput() {
		this.output.replaceChildren();
		this.output.hidden = true;
		this.outputChars = 0;
		this.truncated = false;
		this.lastStream = null;
	}

	private append(node: Node, chars = 0) {
		// A block element already starts on a new line: drop the newline that ends the previous text.
		if (node instanceof HTMLElement && node.tagName === 'DIV') {
			const text = this.lastStream?.node;
			if (text?.textContent?.endsWith('\n')) text.textContent = text.textContent.slice(0, -1);
			this.lastStream = null;
		}
		this.output.hidden = false;
		this.output.append(node);
		this.outputChars += chars;
	}

	private write(stream: 'stdout' | 'stderr' | 'result', text: string) {
		if (this.truncated) return;
		if (this.outputChars + text.length > MAX_OUTPUT_CHARS) {
			this.truncated = true;
			const note = document.createElement('div');
			note.className = 'pg-note';
			note.textContent = '… (la salida es demasiado larga y se ha recortado)';
			this.append(note);
			return;
		}
		if (stream === 'result') {
			const row = document.createElement('div');
			row.className = 'pg-result';
			row.textContent = text;
			this.append(row, text.length);
			this.lastStream = null;
			return;
		}
		if (this.lastStream?.name === stream) {
			this.lastStream.node.append(text);
			this.outputChars += text.length;
		} else {
			const span = document.createElement('span');
			span.className = `pg-${stream}`;
			span.textContent = text;
			this.append(span, text.length);
			this.lastStream = { name: stream, node: span };
		}
		this.output.scrollTop = this.output.scrollHeight;
	}

	private ask(prompt: string): Promise<string | null> {
		return new Promise((resolve) => {
			const row = document.createElement('label');
			row.className = 'pg-ask';
			const text = document.createElement('span');
			text.className = 'pg-stdout';
			text.textContent = prompt;
			const input = document.createElement('input');
			input.type = 'text';
			input.autocomplete = 'off';
			input.spellcheck = false;
			input.setAttribute('aria-label', prompt || 'Respuesta para input()');
			const hint = document.createElement('small');
			hint.textContent = 'Escribe y pulsa Enter';
			row.append(text, input, hint);
			this.append(row);
			this.lastStream = null;
			input.focus({ preventScroll: true });
			row.scrollIntoView({ block: 'nearest' });

			const finish = (value: string | null) => {
				runtime.removeEventListener('stopping', cancel);
				const typed = document.createElement('span');
				typed.className = 'pg-typed';
				typed.textContent = value === null ? '' : `${value}\n`;
				hint.remove();
				input.replaceWith(typed);
				resolve(value);
			};
			const cancel = () => finish(null);
			runtime.addEventListener('stopping', cancel, { once: true });
			input.addEventListener('keydown', (event) => {
				if (event.key === 'Enter') {
					event.preventDefault();
					finish(input.value);
				}
			});
		});
	}

	private showError(error: PythonError) {
		const box = document.createElement('div');
		box.className = 'pg-error';
		const title = document.createElement('p');
		title.className = 'pg-error-title';
		const strong = document.createElement('strong');
		strong.textContent = error.type;
		title.append(strong);
		if (error.line) title.append(` en la línea ${error.line}`);
		box.append(title);
		if (error.hint) box.append(richText(error.hint, 'p'));
		const details = document.createElement('details');
		const summary = document.createElement('summary');
		summary.textContent = 'Mensaje original de Python';
		const pre = document.createElement('pre');
		pre.textContent = error.traceback ? `${error.traceback}\n${error.summary}` : error.summary;
		details.append(summary, pre);
		box.append(details);

		const previous = this.options.previous();
		if (error.type === 'NameError' && previous.length > 0) {
			const action = document.createElement('button');
			action.type = 'button';
			action.className = 'pg-btn pg-secondary';
			action.textContent = `Ejecutar los ${previous.length} bloques anteriores de este tema y reintentar`;
			if (previous.length === 1) action.textContent = 'Ejecutar el bloque anterior de este tema y reintentar';
			action.addEventListener('click', async () => {
				for (const block of previous) {
					const result = await block.run();
					if (result.status !== 'ok') return;
				}
				await this.run();
			});
			box.append(action);
		}
		this.append(box);
		this.markLine(error);
	}

	private markLine(error: PythonError) {
		if (!error.line || error.line > this.view.state.doc.lines) return;
		const line = this.view.state.doc.line(error.line);
		const diagnostic: Diagnostic = {
			from: line.from,
			to: Math.max(line.from, line.to),
			severity: 'error',
			message: error.hint ?? error.summary,
			renderMessage: () => richText(error.hint ?? error.summary, 'div'),
		};
		this.view.dispatch(setDiagnostics(this.view.state, [diagnostic]));
	}

	// ----- running ------------------------------------------------------------

	async run(): Promise<RunResult> {
		this.clearOutput();
		this.view.dispatch(setDiagnostics(this.view.state, []));
		this.root.classList.add('pg-running');
		this.runButton.disabled = true;
		this.stopButton.hidden = false;
		const started = performance.now();

		if (runtime.status !== 'ready' && runtime.status !== 'busy') {
			this.status.textContent = 'Cargando Python (solo la primera vez)…';
		} else if (runtime.isRunning) {
			this.status.textContent = 'Esperando a que termine otro bloque…';
		}

		let result: RunResult;
		try {
			const runPromise = runtime.run(this.code, {
				write: (stream, text) => this.write(stream, text),
				ask: (prompt) => this.ask(prompt),
			});
			const onBusy = () => {
				if (runtime.status === 'busy') this.status.textContent = 'Ejecutando…';
			};
			runtime.addEventListener('status', onBusy);
			result = await runPromise.finally(() => runtime.removeEventListener('status', onBusy));
		} catch (error) {
			this.status.textContent = '';
			const box = document.createElement('div');
			box.className = 'pg-error';
			box.append(richText(runtime.message || String(error), 'p'));
			this.append(box);
			result = { status: 'error', error: null };
		}

		const elapsed = (performance.now() - started) / 1000;
		const seconds = elapsed < 0.1 ? '' : ` (${elapsed.toLocaleString('es-ES', { maximumFractionDigits: 1 })} s)`;
		if (result.status === 'ok' || result.status === 'exit') {
			this.status.textContent = `✓ Ejecutado${seconds}`;
			if (this.output.childElementCount === 0) {
				const note = document.createElement('div');
				note.className = 'pg-note';
				note.textContent = 'El código se ha ejecutado sin mostrar nada. Usa print() para ver resultados.';
				this.append(note);
			}
		} else if (result.status === 'interrupted') {
			this.status.textContent = '■ Detenido';
		} else if (result.status === 'restarted') {
			this.status.textContent = '■ Detenido';
			const note = document.createElement('div');
			note.className = 'pg-note';
			note.textContent = 'Python no respondía y se ha reiniciado: las variables de los bloques anteriores se han perdido.';
			this.append(note);
		} else {
			this.status.textContent = '✗ Error';
			if (result.error) this.showError(result.error);
		}

		this.root.classList.remove('pg-running');
		this.runButton.disabled = false;
		this.stopButton.hidden = true;
		return result;
	}
}

/**
 * Editor assistance: autocompletion, hover documentation, signature hints and
 * live syntax checking. Static Spanish docs work offline; jedi (running in the
 * Python worker) adds precise results once Python has loaded.
 */
import {
	type Completion,
	type CompletionContext,
	type CompletionResult,
	snippetCompletion,
} from '@codemirror/autocomplete';
import { localCompletionSource } from '@codemirror/lang-python';
import { syntaxTree } from '@codemirror/language';
import { type Diagnostic, linter } from '@codemirror/lint';
import type { SyntaxNode } from '@lezer/common';
import { type EditorState, StateEffect, StateField } from '@codemirror/state';
import { EditorView, hoverTooltip, keymap, showTooltip, type Tooltip, ViewPlugin, type ViewUpdate } from '@codemirror/view';
import { BUILTINS, type Doc, KEYWORDS, lookup, MEMBERS, signatureText } from './docs-es';
import { type JediCompletion, runtime } from './runtime';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Render a tiny subset of Markdown (`code` and **bold**) safely. */
export function richText(markdown: string, tag: keyof HTMLElementTagNameMap = 'p') {
	const element = document.createElement(tag);
	const parts = markdown.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
	for (const part of parts) {
		if (!part) continue;
		if (part.startsWith('`') && part.endsWith('`')) {
			const code = document.createElement('code');
			code.textContent = part.slice(1, -1);
			element.append(code);
		} else if (part.startsWith('**') && part.endsWith('**')) {
			const strong = document.createElement('strong');
			strong.textContent = part.slice(2, -2);
			element.append(strong);
		} else {
			element.append(part);
		}
	}
	return element;
}

function docElement(title: string, doc: Doc | null, extra?: string) {
	const box = document.createElement('div');
	box.className = 'pg-doc';
	const head = document.createElement('code');
	head.className = 'pg-doc-sig';
	head.textContent = title;
	box.append(head);
	if (doc) {
		box.append(richText(doc.doc));
		if (doc.example) {
			const example = document.createElement('code');
			example.className = 'pg-doc-example';
			example.textContent = doc.example;
			box.append(example);
		}
	} else if (extra) {
		const pre = document.createElement('p');
		pre.className = 'pg-doc-raw';
		pre.textContent = extra;
		box.append(pre);
	}
	return box;
}

function position(state: EditorState, pos: number) {
	const line = state.doc.lineAt(pos);
	return { line: line.number, col: pos - line.from };
}

/** True when the position is inside a comment or a plain string. */
function inStringOrComment(state: EditorState, pos: number) {
	const names: string[] = [];
	for (let node: SyntaxNode | null = syntaxTree(state).resolveInner(pos, -1); node; node = node.parent) {
		names.push(node.name);
	}
	if (names.includes('FormatReplacement')) return false;
	return names.some((name) => name === 'Comment' || name === 'String' || name === 'FormatString');
}

const TYPE_LABEL: Record<string, string> = {
	function: 'función',
	class: 'clase',
	instance: 'variable',
	statement: 'variable',
	param: 'parámetro',
	module: 'módulo',
	keyword: 'palabra clave',
	property: 'atributo',
	path: 'ruta',
};

const CM_TYPE: Record<string, string> = {
	function: 'function',
	class: 'class',
	instance: 'variable',
	statement: 'variable',
	param: 'variable',
	module: 'namespace',
	keyword: 'keyword',
	property: 'property',
};

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
	return Promise.race([promise, new Promise<null>((resolve) => setTimeout(() => resolve(null), ms))]);
}

// ---------------------------------------------------------------------------
// Autocompletion
// ---------------------------------------------------------------------------

const SNIPPETS: Completion[] = [
	snippetCompletion('for ${elemento} in ${coleccion}:\n\t${}', { label: 'for', detail: 'recorrer una colección', type: 'text', boost: 5 }),
	snippetCompletion('for ${i} in range(${10}):\n\t${}', { label: 'for range', detail: 'repetir n veces', type: 'text', boost: 5 }),
	snippetCompletion('if ${condicion}:\n\t${}', { label: 'if', detail: 'condicional', type: 'text', boost: 5 }),
	snippetCompletion('if ${condicion}:\n\t${}\nelse:\n\t${}', { label: 'if else', detail: 'condicional con alternativa', type: 'text', boost: 5 }),
	snippetCompletion('if ${condicion}:\n\t${}\nelif ${otra_condicion}:\n\t${}\nelse:\n\t${}', { label: 'if elif else', detail: 'varias opciones', type: 'text', boost: 5 }),
	snippetCompletion('while ${condicion}:\n\t${}', { label: 'while', detail: 'repetir mientras…', type: 'text', boost: 5 }),
	snippetCompletion('def ${nombre}(${parametros}):\n\t"""${Qué hace la función.}"""\n\t${return resultado}', { label: 'def', detail: 'definir una función', type: 'text', boost: 5 }),
	snippetCompletion('class ${Nombre}:\n\tdef __init__(self, ${parametros}):\n\t\t${self.atributo = atributo}\n\n\tdef ${metodo}(self):\n\t\t${pass}', { label: 'class', detail: 'definir una clase', type: 'text', boost: 5 }),
	snippetCompletion('class ${Hija}(${Padre}):\n\tdef __init__(self, ${parametros}):\n\t\tsuper().__init__(${})\n\t\t${}', { label: 'class hija', detail: 'clase que hereda', type: 'text', boost: 5 }),
	snippetCompletion('def __init__(self, ${parametros}):\n\t${self.atributo = atributo}', { label: '__init__', detail: 'constructor', type: 'text', boost: 5 }),
	snippetCompletion('def __str__(self):\n\treturn f"${texto}"', { label: '__str__', detail: 'texto del objeto', type: 'text', boost: 5 }),
	snippetCompletion('print(f"${texto} {${variable}}")', { label: 'print f', detail: 'mostrar con f-string', type: 'text', boost: -1 }),
	snippetCompletion('${numero} = int(input("${¿Cuántos? }"))', { label: 'input int', detail: 'pedir un número', type: 'text', boost: -1 }),
	snippetCompletion('try:\n\t${}\nexcept ${ValueError}:\n\t${print("Error")}', { label: 'try', detail: 'capturar errores', type: 'text', boost: 5 }),
];

const STATIC_GLOBALS: Completion[] = [
	...Object.entries(BUILTINS).map(([name, doc]) => ({
		label: name,
		type: /^[A-Z]|^(int|float|str|bool|list|dict|tuple|set)$/.test(name) ? 'class' : 'function',
		detail: 'integrada',
		info: () => docElement(signatureText(name, doc), doc),
	})),
	...Object.entries(KEYWORDS).map(([name, doc]) => ({
		label: name,
		type: 'keyword',
		detail: 'palabra clave',
		info: () => docElement(name, { doc }),
	})),
];

function staticMembers(owner: string): Completion[] {
	const groups = MEMBERS[owner] ? [owner] : ['str', 'list', 'dict'];
	const seen = new Map<string, Completion>();
	for (const group of groups) {
		for (const [name, doc] of Object.entries(MEMBERS[group])) {
			const existing = seen.get(name);
			if (existing) {
				existing.detail += ` · ${group}`;
				continue;
			}
			seen.set(name, {
				label: name,
				type: group === 'math' || group === 'random' ? 'function' : 'method',
				detail: group,
				info: () => docElement(`${group}.${signatureText(name, doc)}`, doc),
			});
		}
	}
	return [...seen.values()];
}

function jediOption(item: JediCompletion, member: boolean): Completion {
	const known = lookup(item.full_name);
	const isUser = item.full_name.startsWith('__main__');
	const isMethod = member && item.type === 'function' && !/^(math|random)\./.test(item.full_name);
	const label = isMethod ? 'método' : (TYPE_LABEL[item.type] ?? item.type);
	return {
		label: item.name,
		type: isMethod ? 'method' : (CM_TYPE[item.type] ?? 'variable'),
		detail: isUser ? `${label} tuya` : label,
		boost: isUser ? 3 : 0,
		info: async () => {
			if (known) return docElement(signatureText(item.name, known), known);
			const extra = await runtime.completionDoc(item.name);
			if (!extra || (!extra.doc && !extra.signature)) return null as unknown as Node;
			return docElement(extra.signature || item.name, null, extra.doc);
		},
	};
}

export async function pythonCompletions(context: CompletionContext): Promise<CompletionResult | null> {
	const member = context.matchBefore(/[A-Za-z_][\w.]*\.\w*$/);
	const word = context.matchBefore(/\w+$/);
	if (!member && !word && !context.explicit) return null;
	if (inStringOrComment(context.state, context.pos)) return null;

	const { line, col } = position(context.state, context.pos);
	const code = context.state.doc.toString();
	const jedi = await withTimeout(runtime.complete(code, line, col), 1200);
	if (context.aborted) return null;

	if (member) {
		const dot = member.text.lastIndexOf('.');
		const owner = member.text.slice(0, dot).split('.').pop() ?? '';
		const options = jedi?.length ? jedi.map((item) => jediOption(item, true)) : staticMembers(owner);
		return { from: member.from + dot + 1, options, validFor: /^\w*$/ };
	}

	const options = new Map<string, Completion>();
	for (const option of SNIPPETS) options.set(`snippet:${option.label}`, option);
	for (const option of STATIC_GLOBALS) options.set(option.label, option);
	const locals = localCompletionSource(context);
	for (const option of locals?.options ?? []) {
		if (!options.has(option.label)) options.set(option.label, { ...option, detail: 'variable tuya', boost: 2 });
	}
	for (const item of jedi ?? []) {
		if (options.has(item.name) || item.name.startsWith('_')) continue;
		options.set(item.name, jediOption(item, false));
	}
	return { from: word ? word.from : context.pos, options: [...options.values()], validFor: /^\w*$/ };
}

// ---------------------------------------------------------------------------
// Hover documentation
// ---------------------------------------------------------------------------

export const pythonHover = hoverTooltip(async (view, pos) => {
	const { state } = view;
	const word = state.wordAt(pos);
	if (!word || inStringOrComment(state, pos)) return null;
	const name = state.sliceDoc(word.from, word.to);
	if (!/^[A-Za-z_]\w*$/.test(name)) return null;
	const before = state.sliceDoc(Math.max(0, word.from - 40), word.from);
	const ownerMatch = before.match(/([A-Za-z_]\w*)\.$/);

	let dom: HTMLElement | null = null;
	const { line, col } = position(state, word.to);
	const described = await withTimeout(runtime.describe(state.doc.toString(), line, col), 1200);
	if (described) {
		const known = lookup(described.full_name);
		if (known) dom = docElement(signatureText(described.name, known), known);
		else if (KEYWORDS[name]) dom = docElement(name, { doc: KEYWORDS[name] });
		else {
			const kind = TYPE_LABEL[described.type] ?? described.type;
			dom = docElement(described.signature || `${described.name} · ${kind}`, null, described.doc || undefined);
		}
	} else if (ownerMatch) {
		const owner = ownerMatch[1];
		const groups = MEMBERS[owner] ? [owner] : ['str', 'list', 'dict'];
		const group = groups.find((g) => MEMBERS[g][name]);
		if (group) dom = docElement(`${group}.${signatureText(name, MEMBERS[group][name])}`, MEMBERS[group][name]);
	} else if (BUILTINS[name]) {
		dom = docElement(signatureText(name, BUILTINS[name]), BUILTINS[name]);
	} else if (KEYWORDS[name]) {
		dom = docElement(name, { doc: KEYWORDS[name] });
	}
	if (!dom) return null;
	const content = dom;
	return { pos: word.from, end: word.to, above: true, create: () => ({ dom: content }) };
});

// ---------------------------------------------------------------------------
// Signature hints: show the parameters while typing inside a call
// ---------------------------------------------------------------------------

const setSignature = StateEffect.define<Tooltip | null>();

const signatureField = StateField.define<Tooltip | null>({
	create: () => null,
	update(value, transaction) {
		for (const effect of transaction.effects) if (effect.is(setSignature)) return effect.value;
		if (value && transaction.docChanged) return { ...value, pos: transaction.changes.mapPos(value.pos) };
		return value;
	},
	provide: (field) => showTooltip.from(field),
});

/** Find the call that encloses the cursor: its name, where it starts and the argument index. */
function enclosingCall(state: EditorState, pos: number) {
	const start = Math.max(0, pos - 2000);
	const text = state.sliceDoc(start, pos);
	let depth = 0;
	let commas = 0;
	let quote: string | null = null;
	for (let i = text.length - 1; i >= 0; i--) {
		const ch = text[i];
		if (quote) {
			if (ch === quote && text[i - 1] !== '\\') quote = null;
			continue;
		}
		if (ch === '"' || ch === "'") quote = ch;
		else if (ch === ')' || ch === ']' || ch === '}') depth++;
		else if (ch === '[' || ch === '{') {
			if (depth === 0) return null;
			depth--;
		} else if (ch === '(') {
			if (depth === 0) {
				const name = text.slice(0, i).match(/([A-Za-z_][\w.]*)\s*$/);
				if (!name) return null;
				return { name: name[1], open: start + i, index: commas };
			}
			depth--;
		} else if (ch === ',' && depth === 0) commas++;
		else if (ch === '\n' && depth === 0 && /:\s*$/.test(text.slice(0, i))) return null;
	}
	return null;
}

function signatureDom(name: string, params: string[], index: number | null, doc?: string) {
	const box = document.createElement('div');
	box.className = 'pg-signature';
	const sig = document.createElement('code');
	sig.append(`${name}(`);
	params.forEach((param, i) => {
		if (i > 0) sig.append(', ');
		const current = index !== null && (i === index || (i === params.length - 1 && param.startsWith('*') && index >= i));
		if (current) {
			const strong = document.createElement('strong');
			strong.textContent = param;
			sig.append(strong);
		} else sig.append(param);
	});
	sig.append(')');
	box.append(sig);
	if (doc) box.append(richText(doc));
	return box;
}

function staticSignature(fullName: string) {
	const parts = fullName.split('.');
	const name = parts.pop()!;
	const owner = parts.pop();
	if (!owner) return BUILTINS[name] ? { name, doc: BUILTINS[name] } : null;
	const groups = MEMBERS[owner] ? [owner] : ['str', 'list', 'dict'];
	const group = groups.find((g) => MEMBERS[g][name]);
	return group ? { name: `${owner}.${name}`, doc: MEMBERS[group][name] } : null;
}

const signaturePlugin = ViewPlugin.fromClass(
	class {
		timer: ReturnType<typeof setTimeout> | null = null;
		request = 0;
		constructor(readonly view: EditorView) {}

		update(update: ViewUpdate) {
			if (!update.docChanged && !update.selectionSet) return;
			if (this.timer) clearTimeout(this.timer);
			this.timer = setTimeout(() => this.compute(), 150);
		}

		async compute() {
			const { state } = this.view;
			const pos = state.selection.main.head;
			const call = state.selection.main.empty ? enclosingCall(state, pos) : null;
			const current = state.field(signatureField);
			if (!call) {
				if (current) this.view.dispatch({ effects: setSignature.of(null) });
				return;
			}
			const request = ++this.request;
			let dom: HTMLElement | null = null;
			const known = staticSignature(call.name);
			if (known) {
				dom = signatureDom(known.name, known.doc.params ?? [], call.index, known.doc.doc);
			} else {
				const { line, col } = position(state, pos);
				const jedi = await withTimeout(runtime.signatures(state.doc.toString(), line, col), 1200);
				if (jedi) {
					const spanish = lookup(jedi.full_name);
					dom = spanish
						? signatureDom(jedi.name, spanish.params ?? jedi.params, jedi.index, spanish.doc)
						: signatureDom(jedi.name, jedi.params, jedi.index, jedi.doc || undefined);
				}
			}
			if (request !== this.request) return;
			const content = dom;
			this.view.dispatch({
				effects: setSignature.of(
					content ? { pos: call.open, above: true, strictSide: true, create: () => ({ dom: content }) } : null,
				),
			});
		}

		destroy() {
			if (this.timer) clearTimeout(this.timer);
		}
	},
);

export const signatureHints = [
	signatureField,
	signaturePlugin,
	keymap.of([
		{
			key: 'Escape',
			run: (view) => {
				if (!view.state.field(signatureField)) return false;
				view.dispatch({ effects: setSignature.of(null) });
				return true;
			},
		},
	]),
	EditorView.domEventHandlers({ blur: (_event, view) => void view.dispatch({ effects: setSignature.of(null) }) }),
];

// ---------------------------------------------------------------------------
// Live syntax checking
// ---------------------------------------------------------------------------

export const syntaxLinter = linter(
	async (view): Promise<Diagnostic[]> => {
		const code = view.state.doc.toString();
		if (!code.trim()) return [];
		const problem = await runtime.check(code);
		if (!problem || problem.line > view.state.doc.lines) return [];
		const line = view.state.doc.line(problem.line);
		let from = Math.min(line.to, line.from + Math.max(0, (problem.col ?? 1) - 1));
		let to = line.to;
		if (problem.end_line === problem.line && problem.end_col && problem.end_col > (problem.col ?? 0)) {
			to = Math.min(line.to, line.from + problem.end_col - 1);
		}
		// Errors reported at the end of a line (e.g. a missing ':') would be invisible: mark the whole line.
		if (to <= from) {
			from = line.from + (line.text.length - line.text.trimStart().length);
			to = line.to;
		}
		return [
			{
				from,
				to,
				renderMessage: () => {
					const box = document.createElement('div');
					if (problem.hint) box.append(richText(problem.hint, 'div'));
					const original = document.createElement('small');
					original.textContent = problem.summary;
					box.append(original);
					return box;
				},
				severity: 'error',
				message: problem.hint ? `${problem.hint}\n(${problem.summary})` : problem.summary,
			},
		];
	},
	{ delay: 700 },
);

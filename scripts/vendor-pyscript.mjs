#!/usr/bin/env node
/**
 * Copies PyScript, the Pyodide interpreter and the Python packages used by the
 * course into public/vendor/pyscript/<version>/, so the site does not depend
 * on any external CDN at runtime.
 *
 * Configure the version and packages in the "pyscript" field of package.json
 * and run:  npm run vendor:pyscript
 */
import { createHash } from 'node:crypto';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { inflateRawSync } from 'node:zlib';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { pyscript } = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
const { version, packages } = pyscript;
const vendorRoot = join(root, 'public', 'vendor', 'pyscript');
const target = join(vendorRoot, version);

// Files of the offline bundle that the site does not need.
const SKIP = [/\.map$/, /^micropython\//, /^pyodide\/pyodide\.d\.ts$/, /^pyodide\/pyodide\.js$/];

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

async function download(url) {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
	return Buffer.from(await response.arrayBuffer());
}

/** Minimal ZIP reader (stored and deflated entries), using the central directory. */
function* unzip(buffer) {
	let end = buffer.length - 22;
	while (end >= 0 && buffer.readUInt32LE(end) !== 0x06054b50) end--;
	if (end < 0) throw new Error('Not a ZIP file');
	const count = buffer.readUInt16LE(end + 10);
	let offset = buffer.readUInt32LE(end + 16);
	for (let i = 0; i < count; i++) {
		const method = buffer.readUInt16LE(offset + 10);
		const compressedSize = buffer.readUInt32LE(offset + 20);
		const nameLength = buffer.readUInt16LE(offset + 28);
		const extraLength = buffer.readUInt16LE(offset + 30);
		const commentLength = buffer.readUInt16LE(offset + 32);
		const localOffset = buffer.readUInt32LE(offset + 42);
		const name = buffer.toString('utf8', offset + 46, offset + 46 + nameLength);
		offset += 46 + nameLength + extraLength + commentLength;
		if (name.endsWith('/')) continue;

		const localNameLength = buffer.readUInt16LE(localOffset + 26);
		const localExtraLength = buffer.readUInt16LE(localOffset + 28);
		const start = localOffset + 30 + localNameLength + localExtraLength;
		const raw = buffer.subarray(start, start + compressedSize);
		if (method === 0) yield { name, data: raw };
		else if (method === 8) yield { name, data: inflateRawSync(raw) };
		else throw new Error(`Unsupported compression method ${method} for ${name}`);
	}
}

const normalize = (name) => name.toLowerCase().replace(/[-_.]+/g, '-');

console.log(`PyScript ${version}`);
const zip = await download(`https://pyscript.net/releases/${version}/offline_${version}.zip`);

await rm(vendorRoot, { recursive: true, force: true });
let total = 0;
const files = [];
for (const { name, data } of unzip(zip)) {
	const match = name.match(/^offline\/pyscript\/(.+)$/);
	if (!match) continue;
	const path = match[1];
	if (SKIP.some((pattern) => pattern.test(path))) continue;
	await mkdir(dirname(join(target, path)), { recursive: true });
	await writeFile(join(target, path), data);
	files.push(path);
	total += data.length;
}
console.log(`  ${files.length} files from the offline bundle (${kb(total)})`);

// Pyodide packages: the offline bundle only has the interpreter, so fetch the wheels we use.
const pyodideMjs = await readFile(join(target, 'pyodide', 'pyodide.mjs'), 'utf8');
const pyodideVersion = pyodideMjs.match(/\b(\d+\.\d+\.\d+)\b/)?.[1];
if (!pyodideVersion) throw new Error('Could not detect the Pyodide version');
console.log(`Pyodide ${pyodideVersion}`);

const lockPath = join(target, 'pyodide', 'pyodide-lock.json');
const lock = JSON.parse(await readFile(lockPath, 'utf8'));

/**
 * Resolve the packages exactly like the browser does: run this same Pyodide in
 * Node and install them with micropip (it uses the Pyodide distribution when it
 * has the package and PyPI otherwise, honouring the Emscripten-only markers).
 */
async function resolve() {
	const scratch = await mkdtemp(join(tmpdir(), 'pyodide-'));
	for (const file of ['pyodide.mjs', 'pyodide.asm.mjs', 'pyodide.asm.wasm', 'python_stdlib.zip', 'pyodide-lock.json']) {
		await copyFile(join(target, 'pyodide', file), join(scratch, file));
	}
	const quiet = () => {};
	const { loadPyodide } = await import(pathToFileURL(join(scratch, 'pyodide.mjs')).href);
	const pyodide = await loadPyodide({ indexURL: `${scratch}/`, stdout: quiet, stderr: quiet });
	await pyodide.loadPackage('micropip', { messageCallback: quiet });
	const micropip = pyodide.pyimport('micropip');
	await micropip.install(pyodide.toPy(packages));
	const installed = JSON.parse(
		pyodide.runPython('import json, micropip; json.dumps([p.name for p in micropip.list().values()])'),
	);
	const frozen = JSON.parse(micropip.freeze());
	await rm(scratch, { recursive: true, force: true });
	const wanted = new Set(installed.map(normalize).filter((name) => name !== 'micropip'));
	return Object.entries(frozen.packages).filter(([key]) => wanted.has(normalize(key)));
}

/** Top-level modules of a wheel, so Pyodide can load it automatically from an import. */
function wheelImports(data) {
	const modules = new Set();
	for (const { name } of unzip(data)) {
		const top = name.split('/')[0];
		if (/\.(dist-info|data)$/.test(top)) continue;
		if (name.includes('/')) modules.add(top);
		else if (/\.py$/.test(top)) modules.add(top.slice(0, -3));
	}
	return [...modules];
}

const entries = [];
for (const [key, info] of await resolve()) {
	const fromPyPI = /^https?:\/\//.test(info.file_name);
	// Packages from the Pyodide distribution come back as paths of the scratch index: keep the file name.
	const fileBase = info.file_name.split('/').pop();
	const url = fromPyPI ? info.file_name : `https://cdn.jsdelivr.net/pyodide/v${pyodideVersion}/full/${fileBase}`;
	const data = await download(url);
	const sha256 = createHash('sha256').update(data).digest('hex');
	if (info.sha256 && sha256 !== info.sha256) throw new Error(`Checksum mismatch for ${url}`);
	const fileName = url.split('/').pop();
	await writeFile(join(target, 'pyodide', fileName), data);
	const entry = { ...info, file_name: fileName, sha256 };
	if (!entry.imports?.length) entry.imports = wheelImports(data);
	entries.push([key, entry]);
	console.log(`  ${key} ${info.version} ${fromPyPI ? '(PyPI)' : '(Pyodide)'} ${kb(data.length)}`);
}

// Keep only the vendored packages in the lock file, so importing anything else
// fails fast with ModuleNotFoundError instead of trying to download it.
lock.packages = Object.fromEntries(entries.sort(([a], [b]) => a.localeCompare(b)));
await writeFile(lockPath, JSON.stringify(lock));

await writeFile(
	join(target, 'README.md'),
	`# Vendored PyScript ${version}

Generated by \`npm run vendor:pyscript\` (scripts/vendor-pyscript.mjs). Do not edit by hand.

- PyScript ${version}: offline bundle from https://pyscript.net/releases/${version}/ (Apache License 2.0).
- Pyodide ${pyodideVersion}: interpreter included in that bundle (Mozilla Public License 2.0).
- Python packages resolved with micropip for \`${packages.join(', ')}\`, from the Pyodide ${pyodideVersion}
  distribution or PyPI, checked against their SHA-256:
${entries.map(([key, info]) => `  - ${key} ${info.version}`).join('\n')}
`,
);
console.log(`Done: ${target}`);

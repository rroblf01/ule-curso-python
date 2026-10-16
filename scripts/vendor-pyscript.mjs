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
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
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
const byName = new Map(Object.entries(lock.packages).map(([key, info]) => [normalize(key), [key, info]]));

const wanted = new Map();
const visit = (name) => {
	const entry = byName.get(normalize(name));
	if (!entry) throw new Error(`Package not found in pyodide-lock.json: ${name}`);
	if (wanted.has(entry[0])) return;
	wanted.set(entry[0], entry[1]);
	for (const dependency of entry[1].depends ?? []) visit(dependency);
};
packages.forEach(visit);

const wheels = [];
for (const [key, info] of wanted) {
	const data = await download(`https://cdn.jsdelivr.net/pyodide/v${pyodideVersion}/full/${info.file_name}`);
	const sha256 = createHash('sha256').update(data).digest('hex');
	if (info.sha256 && sha256 !== info.sha256) throw new Error(`Checksum mismatch for ${info.file_name}`);
	await writeFile(join(target, 'pyodide', info.file_name), data);
	wheels.push(info.file_name);
	console.log(`  ${key} ${info.version} (${kb(data.length)})`);
}

// Keep only the vendored packages in the lock file, so importing anything else
// fails fast with ModuleNotFoundError instead of trying to download it.
lock.packages = Object.fromEntries(wanted);
await writeFile(lockPath, JSON.stringify(lock));

await writeFile(
	join(target, 'README.md'),
	`# Vendored PyScript ${version}

Generated by \`npm run vendor:pyscript\` (scripts/vendor-pyscript.mjs). Do not edit by hand.

- PyScript ${version}: offline bundle from https://pyscript.net/releases/${version}/ (Apache License 2.0).
- Pyodide ${pyodideVersion}: interpreter included in that bundle (Mozilla Public License 2.0).
- Packages from the Pyodide ${pyodideVersion} distribution, checked against the SHA-256 of pyodide-lock.json:
${[...wanted].map(([key, info]) => `  - ${key} ${info.version}`).join('\n')}
`,
);
console.log(`Done: ${target}`);

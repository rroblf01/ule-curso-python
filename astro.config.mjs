// @ts-check
import { defineConfig } from 'astro/config';

/**
 * Python editors need SharedArrayBuffer (for input() and for stopping code),
 * which browsers only enable on cross-origin isolated pages.
 */
const crossOriginIsolation = {
	'Cross-Origin-Opener-Policy': 'same-origin',
	'Cross-Origin-Embedder-Policy': 'require-corp',
};

// https://astro.build/config
export default defineConfig({
	server: { headers: crossOriginIsolation },
	markdown: {
		shikiConfig: {
			themes: { light: 'github-light', dark: 'github-dark' },
			transformers: [
				{
					// Keep the code block meta (e.g. ```python static) as data-meta on <pre>.
					name: 'code-meta',
					pre(node) {
						const meta = this.options.meta?.__raw;
						if (meta) node.properties['data-meta'] = meta;
					},
				},
			],
		},
	},
});

import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const lessons = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/lessons' }),
	schema: z.object({
		title: z.string(),
		day: z.number().int().min(1).max(3),
		order: z.number().int(),
		minutes: z.number().int().positive(),
		/** Turn the Python blocks of this lesson into runnable editors. */
		runnable: z.boolean().default(true),
	}),
});

export const collections = { lessons };

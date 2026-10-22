/**
 * Python packages loaded in the background as soon as the visitor enters the
 * site (after the interpreter boots), and the modules imported to warm them up,
 * so the first block that uses them (day 3, the playground) runs at once.
 */
export const PRELOAD = {
	packages: ['pydantic', 'pydantic-ai-slim'],
	modules: ['pydantic', 'pydantic_ai'],
};

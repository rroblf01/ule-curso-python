/**
 * AI server and model of day 3. They are written into the "Modelo de IA" code
 * block shown above every lesson of the day, where students can edit them.
 */
export const AI_DEFAULTS = {
	/** Ollama's OpenAI-compatible API. */
	server: 'https://ollama.ricardorobles.es/v1',
	model: 'granite4:350m',
};

/** Code of the block that defines MODELO for every lesson of day 3: plain Pydantic AI. */
export const MODEL_SETUP_CODE = `import os

os.environ["OLLAMA_BASE_URL"] = "${AI_DEFAULTS.server}"
MODELO = "ollama:${AI_DEFAULTS.model}"`;

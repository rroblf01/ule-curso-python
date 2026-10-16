/**
 * AI server and model of day 3. They are written into the "Modelo de IA" code
 * block shown above every lesson of the day, where students can edit them.
 */
export const AI_DEFAULTS = {
	/** Ollama server (with or without the /v1 suffix). */
	server: 'https://ollama.ricardorobles.es',
	model: 'granite4:350m',
};

/** Code of the block that defines MODELO for every lesson of day 3. */
export const MODEL_SETUP_CODE = `from curso import crear_modelo

SERVIDOR = "${AI_DEFAULTS.server}"
MODELO = crear_modelo("${AI_DEFAULTS.model}", SERVIDOR)

print(f"Modelo: {MODELO.model_name} · Servidor: {SERVIDOR}")`;

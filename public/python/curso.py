"""Modelo de IA del curso, ya configurado para usarlo desde el navegador.

Uso:

    from curso import MODELO
    agente = Agent(MODELO)
"""

import httpx2
from pydantic_ai.models.ollama import OllamaModel
from pydantic_ai.providers.ollama import OllamaProvider

# Servidor Ollama del curso y modelo que tiene instalado.
SERVIDOR = "https://ollama.ricardorobles.es/v1"
NOMBRE_MODELO = "qwen3.5:0.8b"


async def _quitar_cabeceras_no_permitidas(peticion):
    # El navegador solo deja enviar a otro dominio las cabeceras que ese servidor acepta (CORS),
    # y Ollama no acepta esta, que añade la librería de OpenAI.
    peticion.headers.pop("x-stainless-read-timeout", None)


def crear_modelo(nombre=NOMBRE_MODELO, servidor=SERVIDOR):
    """Crea un modelo de Ollama listo para usar en Pydantic AI."""
    cliente = httpx2.AsyncClient(
        timeout=180,  # los modelos en CPU pueden tardar: esperamos hasta 3 minutos
        event_hooks={"request": [_quitar_cabeceras_no_permitidas]},
    )
    return OllamaModel(
        nombre,
        provider=OllamaProvider(base_url=servidor, http_client=cliente),
        settings={
            "extra_body": {
                # Sin "razonamiento": el modelo contesta directamente, en segundos en vez de minutos.
                "reasoning_effort": "none",
                # Como mucho unas 500 palabras, para que ninguna respuesta tarde demasiado.
                "max_tokens": 700,
            }
        },
    )


MODELO = crear_modelo()

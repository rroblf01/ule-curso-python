"""Ayudas del curso para usar un modelo de Ollama desde el navegador.

Uso:

    from curso import crear_modelo

    MODELO = crear_modelo("granite4:350m", "https://ollama.ricardorobles.es")
    agente = Agent(MODELO)
"""

import httpx2
from pydantic_ai.models.ollama import OllamaModel
from pydantic_ai.providers.ollama import OllamaProvider


async def _quitar_cabeceras_no_permitidas(peticion):
    # El navegador solo deja enviar a otro dominio las cabeceras que ese servidor acepta (CORS),
    # y Ollama no acepta esta, que añade la librería de OpenAI.
    peticion.headers.pop("x-stainless-read-timeout", None)


def crear_modelo(nombre, servidor):
    """Crea un modelo de Ollama listo para usar en Pydantic AI.

    nombre: el modelo instalado en el servidor, por ejemplo "granite4:350m".
    servidor: la dirección del servidor Ollama, por ejemplo "http://localhost:11434".
    """
    servidor = servidor.rstrip("/").removesuffix("/v1")
    cliente = httpx2.AsyncClient(
        timeout=180,  # los modelos en CPU pueden tardar: esperamos hasta 3 minutos
        event_hooks={"request": [_quitar_cabeceras_no_permitidas]},
    )
    return OllamaModel(
        nombre,
        provider=OllamaProvider(base_url=f"{servidor}/v1", http_client=cliente),  # /v1: API compatible con OpenAI
        settings={
            "extra_body": {
                # Si el modelo sabe "razonar" antes de contestar, que no lo haga: tardaría minutos.
                "reasoning_effort": "none",
                # Como mucho unas 500 palabras, para que ninguna respuesta tarde demasiado.
                "max_tokens": 700,
            }
        },
    )

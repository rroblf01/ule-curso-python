"""Modelo de IA del curso, ya configurado para usarlo desde el navegador.

Uso:

    from curso import MODELO
    agente = Agent(MODELO)

El servidor y el modelo se eligen en el panel «Modelo de IA» de la web y se
pueden cambiar en cualquier momento, incluso con agentes ya creados.
"""

import os

import httpx2
from pydantic_ai.models.ollama import OllamaModel
from pydantic_ai.models.wrapper import WrapperModel
from pydantic_ai.providers.ollama import OllamaProvider

# Servidor Ollama y modelo. En la web los pone el panel «Modelo de IA».
SERVIDOR = os.environ.get("CURSO_SERVIDOR", "https://ollama.ricardorobles.es")
NOMBRE_MODELO = os.environ.get("CURSO_MODELO", "qwen3.5:0.8b")


async def _quitar_cabeceras_no_permitidas(peticion):
    # El navegador solo deja enviar a otro dominio las cabeceras que ese servidor acepta (CORS),
    # y Ollama no acepta esta, que añade la librería de OpenAI.
    peticion.headers.pop("x-stainless-read-timeout", None)


def crear_modelo(nombre=None, servidor=None):
    """Crea un modelo de Ollama listo para usar en Pydantic AI."""
    servidor = (servidor or SERVIDOR).rstrip("/").removesuffix("/v1")
    cliente = httpx2.AsyncClient(
        timeout=180,  # los modelos en CPU pueden tardar: esperamos hasta 3 minutos
        event_hooks={"request": [_quitar_cabeceras_no_permitidas]},
    )
    return OllamaModel(
        nombre or NOMBRE_MODELO,
        provider=OllamaProvider(base_url=f"{servidor}/v1", http_client=cliente),  # /v1: API compatible con OpenAI
        settings={
            "extra_body": {
                # Sin "razonamiento": el modelo contesta directamente, en segundos en vez de minutos.
                "reasoning_effort": "none",
                # Como mucho unas 500 palabras, para que ninguna respuesta tarde demasiado.
                "max_tokens": 700,
            }
        },
    )


class ModeloDelCurso(WrapperModel):
    """Envuelve el modelo elegido para poder cambiarlo sin crear de nuevo los agentes."""

    def __repr__(self):
        return f"ModeloDelCurso({self.model_name!r}, servidor={SERVIDOR!r})"


MODELO = ModeloDelCurso(crear_modelo())


def configurar(servidor=None, modelo=None):
    """Cambia el servidor y/o el modelo que usa MODELO (y todos los agentes creados con él)."""
    global SERVIDOR, NOMBRE_MODELO
    SERVIDOR = (servidor or SERVIDOR).rstrip("/").removesuffix("/v1")
    NOMBRE_MODELO = modelo or NOMBRE_MODELO
    MODELO.wrapped = crear_modelo()
    return MODELO

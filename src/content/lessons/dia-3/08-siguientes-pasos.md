---
title: Buen uso de la IA y siguientes pasos
day: 3
order: 8
minutes: 5
runnable: false
---

## Usar la IA con cabeza

- **Puede equivocarse.** Los modelos generan texto que *suena* correcto, pero a veces es falso (alucinaciones). Un modelo de 350 millones de parámetros como el nuestro se equivoca mucho más que los grandes de la nube: revisa siempre los resúmenes y las preguntas con tus apuntes.
- **No sustituye a estudiar.** Úsala para repasar y detectar lo que no sabes, no para evitar leer el temario.
- **Cuidado con los datos personales.** Con el servidor del curso, tus apuntes van a ese servidor y no a ninguna empresa de IA. Si usas un modelo en la nube, lo que envías sí llega al proveedor, y en los niveles gratuitos puede usarlo para mejorar sus servicios. No envíes información privada tuya ni de otras personas.
- **Respeta las normas de tu asignatura** sobre el uso de IA en trabajos y exámenes.

## Modelo abierto o en la nube

| | Abierto con Ollama (el de hoy) | En la nube (Gemini, OpenAI, Claude…) |
|---|---|---|
| Coste | Gratis (pagas el servidor o la GPU) | Gratis con límites, o de pago |
| Clave de API | No | Sí |
| Calidad | Depende del tamaño: el nuestro es muy básico | La mejor |
| Velocidad | Depende del servidor y de cuánta gente lo use | Normalmente rápida |
| Privacidad | Los datos van solo a tu servidor | Los datos van al proveedor |
| Puesta en marcha | Instalar Ollama y descargar el modelo | Solo la clave |

## Cambiar de modelo es una línea

Una de las ventajas de Pydantic AI es que el resto del código **no cambia** si usas otro modelo u otro proveedor:

```python
MODELO = OllamaModel("granite4:350m", provider=OllamaProvider(base_url="https://ollama.ricardorobles.es/v1"))  # El de hoy
MODELO = OllamaModel("granite4:350m", provider=OllamaProvider(base_url="http://localhost:11434/v1"))         # Ollama en tu ordenador
MODELO = "google:gemini-2.5-flash"       # Google Gemini (requiere GOOGLE_API_KEY)
MODELO = "openai:gpt-5.1-mini"           # OpenAI (requiere OPENAI_API_KEY)
MODELO = "anthropic:claude-sonnet-5-5"   # Anthropic Claude (requiere ANTHROPIC_API_KEY)
```

### Plan B: Gemini con el nivel gratuito

Si el servidor del curso no responde, puedes usar Gemini desde Google Colab, que tiene un nivel gratuito sin tarjeta:

1. Crea una clave en [Google AI Studio](https://aistudio.google.com/apikey) (requiere ser mayor de edad).
2. En Colab, pulsa el icono de la **llave 🔑** (*Secretos*) y añade un secreto llamado `GOOGLE_API_KEY` con tu clave. Activa **Acceso desde el cuaderno**.
3. Ejecuta esta celda en Colab:

```python
!pip install -q "pydantic-ai-slim[google]"

import os
from google.colab import userdata

os.environ["GOOGLE_API_KEY"] = userdata.get("GOOGLE_API_KEY")
os.environ["PYDANTIC_AI_NO_BANNER"] = "1"

MODELO = "google:gemini-2.5-flash"
```

Todo lo demás (agentes, `NativeOutput`, el asistente de estudio) funciona **sin tocar nada**: copia los bloques de esta web en Colab.

> **⚠️ Tu clave de API es como una contraseña.** No la escribas dentro del código, no la subas a GitHub y no la compartas.

## Lo que no nos ha dado tiempo a ver

- **Herramientas (*tools*):** funciones de Python que la IA puede decidir llamar, por ejemplo para consultar una base de datos, hacer cálculos exactos o buscar en Internet.
- **Streaming:** mostrar la respuesta mientras se genera, como en los chats.
- **Interfaces gráficas:** convertir tu asistente en una web con librerías como [Streamlit](https://streamlit.io/) o [Gradio](https://www.gradio.app/).
- **Ollama en tu ordenador:** si tienes una GPU (o un Mac con chip M), puedes [instalar Ollama](https://ollama.com/download) y usar exactamente el mismo código fuera de Colab.

## Para seguir aprendiendo Python

- 📖 [Tutorial oficial de Python (en español)](https://docs.python.org/es/3/tutorial/)
- 🤖 [Documentación de Pydantic AI](https://pydantic.dev/docs/ai/overview/)
- 🦙 [Biblioteca de modelos de Ollama](https://ollama.com/library)
- 🧩 [Exercism – Python](https://exercism.org/tracks/python): ejercicios con corrección automática.
- 🎄 [Advent of Code](https://adventofcode.com/): retos de programación cada diciembre.

## Resumen del curso

| Día | Lo que has aprendido |
|-----|----------------------|
| 1 | Variables, tipos de datos, condicionales, bucles y funciones |
| 2 | Clases, atributos, métodos, herencia y polimorfismo |
| 3 | Integrar un modelo de IA en tus programas y obtener de él datos estructurados |

**¡Enhorabuena! 🐍🎉** Con estas tres piezas ya puedes construir programas útiles de verdad.

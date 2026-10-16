---
title: Buen uso de la IA y siguientes pasos
day: 3
order: 8
minutes: 5
---

## Usar la IA con cabeza

- **Puede equivocarse.** Los modelos generan texto que *suena* correcto, pero a veces es falso (alucinaciones). Revisa siempre los resúmenes y las preguntas con tus apuntes.
- **No sustituye a estudiar.** Úsala para repasar y detectar lo que no sabes, no para evitar leer el temario.
- **Cuidado con los datos personales.** Lo que envías a la API sale de tu ordenador. En los niveles gratuitos, el proveedor puede usar esos datos para mejorar sus servicios. No envíes información privada tuya ni de otras personas.
- **Protege tu clave de API.** Nunca la escribas dentro del código ni la compartas.
- **Respeta las normas de tu asignatura** sobre el uso de IA en trabajos y exámenes.

## Cambiar de modelo es una línea

Una de las ventajas de Pydantic AI es que el resto del código **no cambia** si usas otro proveedor:

```python
MODELO = "google:gemini-2.5-flash"       # Google Gemini
MODELO = "openai:gpt-5.1-mini"           # OpenAI (requiere OPENAI_API_KEY)
MODELO = "anthropic:claude-sonnet-5-5"   # Anthropic Claude (requiere ANTHROPIC_API_KEY)
```

Cada proveedor necesita su propia clave y su paquete (`pydantic-ai-slim[openai]`, `pydantic-ai-slim[anthropic]`…), y la mayoría son de pago.

## Lo que no nos ha dado tiempo a ver

- **Herramientas (*tools*):** funciones de Python que la IA puede decidir llamar, por ejemplo para consultar una base de datos, hacer cálculos exactos o buscar en Internet.
- **Streaming:** mostrar la respuesta mientras se genera, como en los chats.
- **Interfaces gráficas:** convertir tu asistente en una web con librerías como [Streamlit](https://streamlit.io/) o [Gradio](https://www.gradio.app/).

## Para seguir aprendiendo Python

- 📖 [Tutorial oficial de Python (en español)](https://docs.python.org/es/3/tutorial/)
- 🤖 [Documentación de Pydantic AI](https://pydantic.dev/docs/ai/overview/)
- 🧩 [Exercism – Python](https://exercism.org/tracks/python): ejercicios con corrección automática.
- 🎄 [Advent of Code](https://adventofcode.com/): retos de programación cada diciembre.

## Resumen del curso

| Día | Lo que has aprendido |
|-----|----------------------|
| 1 | Variables, tipos de datos, condicionales, bucles y funciones |
| 2 | Clases, atributos, métodos, herencia y polimorfismo |
| 3 | Integrar modelos de IA en tus programas con datos estructurados |

**¡Enhorabuena! 🐍🎉** Con estas tres piezas ya puedes construir programas útiles de verdad.

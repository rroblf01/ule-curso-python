---
title: ¿Qué es un LLM y cómo se usa desde Python?
day: 3
order: 1
minutes: 5
runnable: false
---

> **⏱️ Antes de empezar:** abre Colab y ejecuta ya la **celda de preparación** del tema siguiente. Tarda unos minutos en descargar el modelo, así que lo dejamos trabajando mientras vemos la teoría.

## Modelos de lenguaje (LLM)

Un **LLM** (*Large Language Model*, modelo de lenguaje grande) es un programa entrenado con enormes cantidades de texto para **predecir la siguiente palabra**. Haciendo eso muy bien, es capaz de resumir, traducir, explicar, programar o crear preguntas de examen. ChatGPT, Gemini o Claude son ejemplos.

Hasta ahora los has usado desde una web de chat. Hoy vas a usarlos **desde tus propios programas**.

## Modelos en la nube y modelos abiertos

| | Modelos en la nube | Modelos abiertos (*open weights*) |
|---|---|---|
| Ejemplos | ChatGPT, Gemini, Claude | Qwen, Llama, Gemma, Mistral |
| ¿Dónde se ejecutan? | En los servidores de la empresa | En **tu** máquina (o la que tú elijas) |
| ¿Qué necesitas? | Una clave de API (normalmente de pago) | Una GPU y descargar el modelo |
| Capacidad | Los más potentes | Algo menos potentes, pero muy útiles |
| Privacidad | Tus datos salen hacia el proveedor | Tus datos no salen de la máquina |

Hoy usaremos un **modelo abierto**, **Qwen 3** (de Alibaba), ejecutándolo en la **GPU gratuita de Google Colab**. Así **no necesitas ninguna clave ni cuenta de pago**.

## Las piezas que vamos a usar

```text
Tu cuaderno de Colab (Python)
   │
   │  Pydantic AI envía la petición por HTTP a localhost:11434
   ▼
Ollama (un servidor que corre en la misma máquina de Colab)
   │
   ▼
Modelo Qwen 3 cargado en la GPU T4
```

- **[Ollama](https://ollama.com):** un programa que descarga modelos abiertos y los sirve a través de una **API**, igual que lo haría OpenAI o Google, pero en local.
- **[Pydantic AI](https://pydantic.dev/docs/ai/overview/):** la librería de Python con la que hablaremos con el modelo.

## ¿Por qué Pydantic AI?

- **Funciona con muchos proveedores** (Ollama, Google Gemini, OpenAI, Anthropic, Mistral…) cambiando una sola línea.
- Permite pedir respuestas **estructuradas**: en lugar de un texto libre, la IA te devuelve **objetos de Python** con los campos que tú definas. ¡Con clases, como las de ayer!
- Lo crea el mismo equipo que hizo **Pydantic**, la librería de validación de datos más usada de Python.

## El objetivo de hoy

Construir un **asistente de estudio** que, a partir del texto de tus apuntes:

1. 📝 Genere un **resumen** con las ideas clave.
2. ❓ Cree un **test de preguntas** con varias opciones.
3. 🎮 Te haga el test de forma interactiva y te diga tu nota.

---
title: "Proyecto (2/2): generador de tests"
day: 3
order: 7
minutes: 15
---

Ahora la parte más divertida: que la IA nos **haga un test** sobre los apuntes y nos ponga nota.

> Usaremos los `apuntes` del tema anterior: si no lo has hecho, ejecuta antes su primer bloque.

## Paso 1: definir las preguntas

```python
from typing import Annotated

from pydantic import BaseModel, Field
from pydantic_ai import Agent, NativeOutput


class Pregunta(BaseModel):
    enunciado: str = Field(description="La pregunta, clara y sin ambigüedades")
    opciones: list[Annotated[str, Field(min_length=3)]] = Field(
        min_length=4, max_length=4, description="Cuatro posibles respuestas"
    )
    correcta: int = Field(ge=0, le=3, description="Posición (0-3) de la opción correcta")
    explicacion: str = Field(description="Por qué esa es la respuesta correcta")


class Test(BaseModel):
    preguntas: list[Pregunta] = Field(min_length=3, max_length=5, description="Entre 3 y 5 preguntas")
```

Las restricciones de Pydantic son nuestra mejor ayuda con un modelo tan pequeño, porque `NativeOutput` **obliga** al modelo a cumplirlas:

- `min_length=3` en `preguntas`: al menos tres preguntas (los modelos pequeños tienden a quedarse cortos).
- `Annotated[str, Field(min_length=3)]`: cada opción es un texto de 3 caracteres o más. Sin esto, a veces las opciones son solo letras sueltas: `"a"`, `"b"`, `"c"`…

## Paso 2: el agente generador

```python
agente_test = Agent(
    MODELO,
    output_type=NativeOutput(Test),
    retries=3,
    instructions=(
        "Eres un profesor universitario que crea preguntas tipo test para repasar. "
        "Crea preguntas en español basadas ÚNICAMENTE en los apuntes que te den. "
        "Solo una opción debe ser correcta y las incorrectas deben ser creíbles. "
        "Varía la posición de la respuesta correcta."
    ),
)

resultado = await agente_test.run(f"Crea 3 preguntas sobre estos apuntes:\n\n{apuntes}")
test = resultado.output

print(f"Se han generado {len(test.preguntas)} preguntas")
```

Generar el test tarda unos segundos (más si el servidor está ocupado): el modelo tiene que escribir todas las preguntas, opciones y explicaciones.

> **⚠️ Revisa las preguntas:** con un modelo tan pequeño, a veces marca como correcta una opción que no lo es, o se inventa datos. Detectar esos errores con tus apuntes también es repasar.

## Paso 3: barajar las opciones

Al probarlo verás que el modelo tiende a poner la respuesta correcta **siempre en la misma posición** (por ejemplo, siempre la C), aunque le pidamos que la varíe. Los modelos de IA no son buenos generando aleatoriedad… pero Python sí:

```python
import random


def barajar(pregunta: Pregunta) -> None:
    """Desordena las opciones y actualiza la posición de la correcta."""
    texto_correcto = pregunta.opciones[pregunta.correcta]
    random.shuffle(pregunta.opciones)
    pregunta.correcta = pregunta.opciones.index(texto_correcto)


for pregunta in test.preguntas:
    barajar(pregunta)
```

> **💡 Lección importante:** no todo hay que pedírselo a la IA. Lo que se puede resolver con código normal (barajar, contar, calcular una nota) es **más fiable, más rápido y gratis** si lo hace Python.

## Paso 4: hacer el test de forma interactiva

Aquí no hay IA: es **Python del día 1** (bucles, `input`, condicionales y funciones):

```python
LETRAS = ["A", "B", "C", "D"]


def hacer_test(test: Test) -> float:
    aciertos = 0

    for numero, pregunta in enumerate(test.preguntas, start=1):
        print(f"\n❓ Pregunta {numero}: {pregunta.enunciado}")
        for letra, opcion in zip(LETRAS, pregunta.opciones):
            print(f"   {letra}) {opcion}")

        respuesta = ""
        while respuesta not in LETRAS:
            respuesta = input("Tu respuesta (A, B, C o D): ").strip().upper()

        if LETRAS.index(respuesta) == pregunta.correcta:
            print("✅ ¡Correcto!")
            aciertos += 1
        else:
            print(f"❌ Incorrecto. Era la {LETRAS[pregunta.correcta]}.")
        print(f"   💬 {pregunta.explicacion}")

    nota = aciertos / len(test.preguntas) * 10
    print(f"\n🎓 Has acertado {aciertos} de {len(test.preguntas)}. Tu nota: {nota:.1f}")
    return nota


hacer_test(test)
```

## Paso 5: todo junto en una clase

Usando lo que aprendimos ayer, podemos empaquetar el asistente en una **clase** reutilizable:

```python
class AsistenteDeEstudio:
    def __init__(self, apuntes: str):
        self.apuntes = apuntes

    async def resumir(self) -> Resumen:
        resultado = await agente_resumen.run(self.apuntes)
        return resultado.output

    async def crear_test(self, num_preguntas: int = 3, dificultad: str = "media") -> Test:
        peticion = (
            f"Crea {num_preguntas} preguntas de dificultad {dificultad} "
            f"sobre estos apuntes:\n\n{self.apuntes}"
        )
        resultado = await agente_test.run(peticion)
        test = resultado.output
        for pregunta in test.preguntas:
            barajar(pregunta)
        return test


asistente = AsistenteDeEstudio(apuntes)

resumen = await asistente.resumir()
print(resumen.resumen)

test = await asistente.crear_test(num_preguntas=3, dificultad="difícil")
hacer_test(test)
```

Este bloque pide un resumen y un test seguidos, así que tarda un poco más, sobre todo si el servidor está ocupado.

> **💡 `async def`:** como los métodos usan `await` por dentro, hay que declararlos con `async def` y llamarlos también con `await`. Es la única novedad respecto a las clases de ayer.

## Retos extra

1. **Repaso de fallos:** haz que `hacer_test` devuelva también la lista de preguntas falladas y vuelve a preguntarlas al final.
2. **Tarjetas de memoria:** crea un modelo `Tarjeta` con `pregunta` y `respuesta` y un agente que genere tarjetas tipo *flashcard*.
3. **Verdadero o falso:** añade a `AsistenteDeEstudio` un método para tests de verdadero/falso.
4. **Comparar modelos:** si tienes Ollama en tu ordenador, descarga otro modelo de la [biblioteca de Ollama](https://ollama.com/library), cámbialo en el bloque **Modelo de IA** y compara la calidad y la velocidad de las preguntas.

```python
# Escribe aquí tus retos: tienes disponibles Pregunta, Test, agente_test, hacer_test y AsistenteDeEstudio
```

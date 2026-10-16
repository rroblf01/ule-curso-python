---
title: "Proyecto (2/2): generador de tests"
day: 3
order: 7
minutes: 12
---

Ahora la parte más divertida: que la IA nos **haga un test** sobre los apuntes y nos ponga nota.

## Paso 1: definir las preguntas

```python
class Pregunta(BaseModel):
    enunciado: str = Field(description="La pregunta, clara y sin ambigüedades")
    opciones: list[str] = Field(
        min_length=4, max_length=4, description="Cuatro posibles respuestas"
    )
    correcta: int = Field(ge=0, le=3, description="Posición (0-3) de la opción correcta")
    explicacion: str = Field(description="Por qué esa es la respuesta correcta")


class Test(BaseModel):
    preguntas: list[Pregunta]
```

## Paso 2: el agente generador

```python
agente_test = Agent(
    MODELO,
    output_type=Test,
    instructions=(
        "Eres un profesor universitario que crea preguntas tipo test para repasar. "
        "Crea preguntas en español basadas ÚNICAMENTE en los apuntes que te den. "
        "Solo una opción debe ser correcta y las incorrectas deben ser creíbles. "
        "Varía la posición de la respuesta correcta."
    ),
)

resultado = await agente_test.run(f"Crea 5 preguntas sobre estos apuntes:\n\n{apuntes}")
test = resultado.output

print(f"Se han generado {len(test.preguntas)} preguntas")
```

## Paso 3: hacer el test de forma interactiva

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

## Paso 4: todo junto en una clase

Usando lo que aprendimos ayer, podemos empaquetar el asistente en una **clase** reutilizable:

```python
class AsistenteDeEstudio:
    def __init__(self, apuntes: str):
        self.apuntes = apuntes

    async def resumir(self) -> Resumen:
        resultado = await agente_resumen.run(self.apuntes)
        return resultado.output

    async def crear_test(self, num_preguntas: int = 5, dificultad: str = "media") -> Test:
        peticion = (
            f"Crea {num_preguntas} preguntas de dificultad {dificultad} "
            f"sobre estos apuntes:\n\n{self.apuntes}"
        )
        resultado = await agente_test.run(peticion)
        return resultado.output


asistente = AsistenteDeEstudio(apuntes)

resumen = await asistente.resumir()
print(resumen.resumen)

test = await asistente.crear_test(num_preguntas=3, dificultad="difícil")
hacer_test(test)
```

> **💡 `async def`:** como los métodos usan `await` por dentro, hay que declararlos con `async def` y llamarlos también con `await`. Es la única novedad respecto a las clases de ayer.

## Retos extra

1. **Repaso de fallos:** haz que `hacer_test` devuelva también la lista de preguntas falladas y vuelve a preguntarlas al final.
2. **Tarjetas de memoria:** crea un modelo `Tarjeta` con `pregunta` y `respuesta` y un agente que genere tarjetas tipo *flashcard*.
3. **Verdadero o falso:** añade a `AsistenteDeEstudio` un método para tests de verdadero/falso.
4. **Apuntes en PDF:** Gemini puede leer PDFs directamente. Investiga `BinaryContent` en la [documentación de Pydantic AI](https://pydantic.dev/docs/ai/advanced-features/input/).

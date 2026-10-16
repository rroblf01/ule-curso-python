---
title: "Proyecto (1/2): resumir tus apuntes"
day: 3
order: 6
minutes: 8
runnable: false
---

Empezamos el **asistente de estudio**. Primero, el resumen.

## Paso 1: los apuntes

Copia un fragmento de tus apuntes de cualquier asignatura (2 o 3 párrafos bastan) y pégalo entre las triples comillas:

```python
apuntes = """
La célula es la unidad básica de la vida. Todos los seres vivos están formados
por una o más células. Existen dos tipos principales: las células procariotas,
que no tienen núcleo definido (como las bacterias), y las células eucariotas,
que sí tienen un núcleo rodeado por una membrana (como las de animales y plantas).

Las células eucariotas contienen orgánulos con funciones específicas: las
mitocondrias producen energía mediante la respiración celular, los ribosomas
fabrican proteínas y, en las células vegetales, los cloroplastos realizan la
fotosíntesis. La membrana plasmática controla qué sustancias entran y salen.
"""
```

> **💡 ¿Tienes los apuntes en un archivo `.txt`?** Súbelo así:
>
> ```python
> from google.colab import files
>
> subidos = files.upload()                      # abre un selector de archivos
> nombre_archivo = list(subidos.keys())[0]
> apuntes = subidos[nombre_archivo].decode("utf-8")
> ```

## Paso 2: definir qué es un "resumen"

```python
from pydantic import BaseModel, Field
from pydantic_ai import Agent, NativeOutput


class Resumen(BaseModel):
    titulo: str = Field(description="Título breve del tema")
    resumen: str = Field(description="Resumen del texto en un párrafo de 3 a 5 frases")
    ideas_clave: list[str] = Field(description="Entre 3 y 6 ideas principales, una frase cada una")
    conceptos: list[str] = Field(description="Términos importantes que conviene memorizar")
```

## Paso 3: el agente

```python
agente_resumen = Agent(
    MODELO,
    output_type=NativeOutput(Resumen),
    instructions=(
        "Eres un asistente de estudio para estudiantes universitarios. "
        "Resume los apuntes que te den en español, de forma clara y fiel al texto. "
        "No inventes información que no aparezca en los apuntes."
    ),
)
```

Fíjate en la última instrucción: los modelos a veces **inventan** cosas (se llaman *alucinaciones*), y los modelos pequeños como el nuestro más todavía. Pedirle que se ciña al texto reduce ese riesgo.

## Paso 4: usarlo y mostrarlo bonito

```python
resultado = await agente_resumen.run(apuntes)
resumen = resultado.output

print(f"📚 {resumen.titulo.upper()}\n")
print(resumen.resumen, "\n")

print("💡 Ideas clave:")
for idea in resumen.ideas_clave:
    print(f"  • {idea}")

print("\n🔑 Conceptos:", ", ".join(resumen.conceptos))
```

## Reto rápido

Añade a `Resumen` un campo `nivel_dificultad: int` entre 1 y 5 (usa `Field(ge=1, le=5)`) y otro `preguntas_para_pensar: list[str]`. Sin tocar nada más, ¡el agente empezará a rellenarlos!

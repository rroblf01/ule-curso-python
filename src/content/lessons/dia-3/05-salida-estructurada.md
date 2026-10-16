---
title: Respuestas estructuradas
day: 3
order: 5
minutes: 8
---

Ahora juntamos las dos piezas: un **agente** que en lugar de texto libre devuelve **objetos Pydantic**. Se consigue con el parámetro `output_type`.

## Ejemplo: extraer datos de un texto

```python
from pydantic import BaseModel, Field
from pydantic_ai import Agent


class Evento(BaseModel):
    titulo: str
    fecha: str = Field(description="Fecha en formato AAAA-MM-DD")
    lugar: str
    es_examen: bool


extractor = Agent(
    MODELO,
    output_type=Evento,
    instructions="Extrae la información del evento descrito por el usuario.",
)

resultado = await extractor.run(
    "Ojo, que el examen final de Cálculo es el 15 de enero de 2027 en el aula 3 de la Escuela de Ingenierías"
)

evento = resultado.output
print(type(evento))      # <class '__main__.Evento'>
print(evento.titulo)
print(evento.fecha)
print(evento.es_examen)  # True
```

`resultado.output` **ya no es un texto**: es un objeto `Evento` con sus atributos, listo para usar en tu programa.

## ¿Cómo funciona por dentro?

1. Pydantic AI convierte tu clase `Evento` en un **esquema** (una descripción de los campos, sus tipos y sus `description`).
2. Envía ese esquema al modelo junto con tu mensaje y le pide que responda **siguiendo el esquema**.
3. Cuando llega la respuesta, Pydantic la **valida**. Si algo no cumple (por ejemplo, falta un campo), Pydantic AI se lo indica al modelo y **le pide que lo corrija** automáticamente.

## Listas de objetos

`output_type` acepta cualquier tipo: también listas.

```python
class Concepto(BaseModel):
    termino: str
    definicion: str = Field(description="Definición breve, de una frase")


glosario = Agent(
    MODELO,
    output_type=list[Concepto],
    instructions="Extrae los conceptos técnicos del texto y defínelos.",
)

texto = """
En Python, una clase es una plantilla para crear objetos. Los atributos guardan
el estado del objeto y los métodos definen su comportamiento. La herencia permite
que una clase hija reutilice el código de una clase padre.
"""

resultado = await glosario.run(texto)

for concepto in resultado.output:
    print(f"• {concepto.termino}: {concepto.definicion}")
```

> **💡** Esto ya es la base del proyecto: si sabes pedir una lista de conceptos, sabes pedir una lista de preguntas de test.

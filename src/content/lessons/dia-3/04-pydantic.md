---
title: "Pydantic: clases que validan datos"
day: 3
order: 4
minutes: 7
---

Antes de pedirle datos ordenados a la IA, necesitamos una forma de **describir qué datos queremos**. Para eso está **Pydantic** (se instala automáticamente con Pydantic AI).

## `BaseModel`: una clase con superpoderes

Con Pydantic creamos clases que **heredan** de `BaseModel` (¡herencia, como ayer!) y declaramos sus atributos con **anotaciones de tipo**:

```python
from pydantic import BaseModel


class Alumno(BaseModel):
    nombre: str
    edad: int
    notas: list[float]


ana = Alumno(nombre="Ana", edad=19, notas=[7.5, 8.0])
print(ana)            # nombre='Ana' edad=19 notas=[7.5, 8.0]
print(ana.nombre)     # Ana
```

¡No hemos tenido que escribir `__init__` ni `__str__`! Pydantic los crea por nosotros a partir de los atributos.

## Valida los datos automáticamente

```python
Alumno(nombre="Hugo", edad="veinte", notas=[5])
```

```text
ValidationError: 1 validation error for Alumno
edad
  Input should be a valid integer, unable to parse string as an integer
```

Si los datos no cumplen los tipos, Pydantic da un error claro. Y si puede convertirlos sin ambigüedad, lo hace: `edad="20"` se convierte en el entero `20`.

## Más control con `Field`

`Field` permite añadir restricciones y una **descripción** de cada campo:

```python
from pydantic import BaseModel, Field


class Pregunta(BaseModel):
    enunciado: str = Field(description="La pregunta, clara y concisa")
    opciones: list[str] = Field(min_length=4, max_length=4)
    correcta: int = Field(ge=0, le=3, description="Posición (0-3) de la opción correcta")
```

- `min_length` / `max_length`: tamaño mínimo y máximo de la lista.
- `ge` / `le`: mayor o igual / menor o igual que.
- `description`: explicación del campo. **Esto es clave**: la IA leerá estas descripciones para saber qué poner en cada campo.

## Convertir a diccionario o JSON

```python
ana.model_dump()        # {'nombre': 'Ana', 'edad': 19, 'notas': [7.5, 8.0]}
ana.model_dump_json()   # '{"nombre":"Ana","edad":19,"notas":[7.5,8.0]}'
```

> **🔗 ¿Por qué nos importa?** Un modelo de IA devuelve texto. Si le pedimos *"dame 5 preguntas de test"*, cada vez nos las dará con un formato distinto y será muy difícil usarlas en un programa. Con Pydantic le decimos **exactamente** qué estructura queremos y Pydantic AI se asegura de que la respuesta la cumpla.

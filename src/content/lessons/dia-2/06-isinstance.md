---
title: Comprobar si un objeto es de una clase
day: 2
order: 6
minutes: 4
---

A veces necesitas saber de qué clase es un objeto antes de hacer algo con él.

## `isinstance(objeto, Clase)`

Devuelve `True` si el objeto es de esa clase **o de una clase hija**:

```python
class Persona:
    def __init__(self, nombre):
        self.nombre = nombre

class Alumno(Persona):
    pass

class Profesor(Persona):
    pass


ana = Alumno("Ana")

isinstance(ana, Alumno)     # True
isinstance(ana, Persona)    # True  ← un Alumno también es una Persona
isinstance(ana, Profesor)   # False
```

También acepta una tupla de clases:

```python
isinstance(ana, (Alumno, Profesor))   # True si es cualquiera de las dos
isinstance(3.5, (int, float))         # True: ¡funciona con tipos básicos!
```

## `type(objeto)`

Devuelve la clase **exacta** del objeto, sin tener en cuenta la herencia:

```python
type(ana)               # <class '__main__.Alumno'>
type(ana) == Alumno     # True
type(ana) == Persona    # False ← aquí está la diferencia
```

## `issubclass(Clase, OtraClase)`

Comprueba relaciones **entre clases** (no entre objetos):

```python
issubclass(Alumno, Persona)    # True
issubclass(Persona, Alumno)    # False
```

| Función | Pregunta que responde | ¿Tiene en cuenta la herencia? |
|---------|-----------------------|-------------------------------|
| `isinstance(obj, C)` | ¿`obj` es un `C`? | Sí |
| `type(obj) == C` | ¿`obj` es exactamente un `C`? | No |
| `issubclass(A, B)` | ¿La clase `A` hereda de `B`? | Sí |

> **💡 Recomendación:** usa casi siempre `isinstance`. Respeta la herencia, que es justo lo que suele interesar.

## Ejemplo de uso

```python
def describir(valor):
    if isinstance(valor, str):
        return f"Texto de {len(valor)} caracteres"
    elif isinstance(valor, (int, float)):
        return f"Número: {valor}"
    elif isinstance(valor, list):
        return f"Lista con {len(valor)} elementos"
    return "No sé qué es esto"
```

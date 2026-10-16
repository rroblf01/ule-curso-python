---
title: Clases y objetos
day: 2
order: 2
minutes: 8
---

## Definir una clase

```python
class Alumno:
    def __init__(self, nombre, grado):
        self.nombre = nombre
        self.grado = grado
```

- `class Alumno:` define la clase. Por convenio, su nombre va en `CamelCase` (cada palabra empieza en mayúscula).
- `__init__` es un método especial, el **constructor**: se ejecuta automáticamente al crear cada objeto y sirve para darle sus valores iniciales.
- `self` representa **al propio objeto** que se está creando. `self.nombre = nombre` significa "guarda en *este* objeto un atributo `nombre`".

## Crear objetos (instanciar)

```python
lucia = Alumno("Lucía", "Ingeniería Informática")
pablo = Alumno("Pablo", "Biotecnología")

print(lucia.nombre)   # Lucía
print(pablo.grado)    # Biotecnología
```

Cada objeto es **independiente**: tiene sus propios valores.

```python
lucia.nombre = "Lucía M."
print(lucia.nombre)   # Lucía M.
print(pablo.nombre)   # Pablo (no ha cambiado)
```

## ¿Qué pasa con `self`?

Cuando escribes `Alumno("Lucía", "Ingeniería Informática")`, Python:

1. Crea un objeto vacío.
2. Llama a `__init__(objeto_nuevo, "Lucía", "Ingeniería Informática")`. Ese `objeto_nuevo` es el `self`.
3. Te devuelve el objeto ya rellenado.

Por eso **nunca pasas `self` a mano**: Python lo hace por ti.

> **⚠️ Errores típicos:** olvidar `self` como primer parámetro de los métodos, o escribir `nombre = nombre` en lugar de `self.nombre = nombre` (entonces el valor no se guarda en el objeto).

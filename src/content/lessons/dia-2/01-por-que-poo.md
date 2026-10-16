---
title: ¿Por qué programación orientada a objetos?
day: 2
order: 1
minutes: 5
---

## Repaso rápido del día 1

```python
alumno = {"nombre": "Lucía", "notas": [7.5, 8.0, 6.25]}

def media(notas):
    return sum(notas) / len(notas)

print(f"{alumno['nombre']}: {media(alumno['notas']):.2f}")
```

Funciona, pero imagina un programa con alumnos, profesores, asignaturas y matrículas. Acabarías con decenas de diccionarios sueltos y funciones que no se sabe bien con qué datos trabajan. ¿Y si alguien escribe `"nonbre"` en lugar de `"nombre"`?

## La idea

La **programación orientada a objetos** (POO) agrupa en una misma pieza:

- los **datos** que describen algo → **atributos**
- las **acciones** que puede hacer → **métodos**

Esa pieza se llama **objeto**, y el "molde" para crear objetos se llama **clase**.

| Concepto | Analogía | Ejemplo |
|----------|----------|---------|
| Clase | El plano de una casa | `Alumno` |
| Objeto (instancia) | Cada casa construida con ese plano | `lucia`, `pablo` |
| Atributo | Características de la casa | `nombre`, `notas` |
| Método | Lo que se puede hacer con ella | `media()`, `aprobar()` |

## ¡Ya has usado objetos!

En Python **todo es un objeto**. Cuando hacías esto…

```python
texto = "hola"
texto.upper()

notas = [7, 5, 9]
notas.append(8)
```

…`texto` es un objeto de la clase `str` y `upper()` es uno de sus métodos. `notas` es un objeto de la clase `list` y `append()` es un método. Hoy aprenderás a **crear tus propias clases**.

---
title: Definir tus propias funciones
day: 1
order: 14
minutes: 5
---

Una **función** es un bloque de código con nombre que puedes reutilizar. Evita repetir código y hace los programas más fáciles de leer.

```python
def saludar(nombre):
    print(f"¡Hola, {nombre}!")

saludar("Lucía")
saludar("Pablo")
```

- `def` indica que vamos a definir una función.
- `nombre` es un **parámetro**: un valor que la función recibe.
- El cuerpo va **indentado**, igual que en `if` y `for`.

## Devolver un resultado con `return`

`print` solo **muestra**; `return` **devuelve** el valor para que lo uses después:

```python
def media(numeros):
    return sum(numeros) / len(numeros)

mi_media = media([7.5, 4.0, 9.25, 6.0])
print(f"Tu media es {mi_media:.2f}")
```

> **⚠️ Diferencia clave:** si una función hace `print` en lugar de `return`, no puedes guardar su resultado en una variable (obtendrías `None`).

## Parámetros con valor por defecto

```python
def calcular_precio(precio, iva=0.21):
    return precio * (1 + iva)

calcular_precio(100)          # 121.0  (usa el iva por defecto)
calcular_precio(100, 0.10)    # 110.0
calcular_precio(100, iva=0.04)  # 104.0  (argumento por nombre)
```

## Documentar con *docstrings* y tipos

Es buena práctica explicar qué hace la función y qué tipos espera. Las **anotaciones de tipo** (`: float`, `-> str`) no son obligatorias, pero ayudan mucho (y el día 3 serán importantes):

```python
def calificacion(nota: float) -> str:
    """Convierte una nota numérica en su calificación."""
    if nota < 5:
        return "Suspenso"
    elif nota < 7:
        return "Aprobado"
    elif nota < 9:
        return "Notable"
    return "Sobresaliente"

calificacion(8.2)   # "Notable"
```

> **💡** Cuando se ejecuta un `return`, la función **termina**. Por eso el último `return` no necesita `else`.

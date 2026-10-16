---
title: Bucles while
day: 1
order: 11
minutes: 3
---

Un bucle `while` repite un bloque **mientras una condición sea cierta**. Se usa cuando **no sabemos de antemano** cuántas vueltas habrá que dar.

```python
cuenta_atras = 5

while cuenta_atras > 0:
    print(cuenta_atras)
    cuenta_atras -= 1

print("¡Despegue! 🚀")
```

## Ejemplo típico: repetir hasta que la respuesta sea válida

```python
respuesta = ""

while respuesta != "python":
    respuesta = input("¿Cuál es el mejor lenguaje? ").lower()

print("¡Correcto!")
```

## `while True` + `break`

Otra forma muy común: un bucle "infinito" del que salimos con `break`.

```python
while True:
    texto = input("Escribe algo (o 'salir'): ")
    if texto == "salir":
        break
    print(f"Has escrito: {texto}")
```

> **⚠️ Cuidado con los bucles infinitos:** si la condición nunca se vuelve falsa, el programa no termina. Puedes pararlo con el botón **■ Detener** del editor.

Pruébalo: ejecuta este bucle, espera un par de segundos y pulsa **■ Detener**. Después ejecuta el bloque siguiente para ver cuántas vueltas le ha dado tiempo a dar.

```python
vueltas = 0
while True:
    vueltas += 1
```

```python
print(f"El bucle ha dado {vueltas:,} vueltas")
```

## ¿`for` o `while`?

| Usa `for` cuando… | Usa `while` cuando… |
|---|---|
| Recorres una colección o sabes cuántas vueltas dar | Repites hasta que ocurra algo (respuesta válida, objetivo alcanzado…) |

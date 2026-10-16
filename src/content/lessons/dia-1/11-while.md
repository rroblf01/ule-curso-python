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

> **⚠️ Cuidado con los bucles infinitos:** si la condición nunca se vuelve falsa, el programa no termina. En Colab puedes pararlo con el botón ⏹ de la celda.

## ¿`for` o `while`?

| Usa `for` cuando… | Usa `while` cuando… |
|---|---|
| Recorres una colección o sabes cuántas vueltas dar | Repites hasta que ocurra algo (respuesta válida, objetivo alcanzado…) |

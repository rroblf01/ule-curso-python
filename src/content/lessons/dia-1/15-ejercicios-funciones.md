---
title: "Ejercicios: funciones"
day: 1
order: 15
minutes: 2
---

Haz en clase el **1**. El resto, para casa.

### 1. Área de un rectángulo

Crea una función `area_rectangulo(base, altura)` que devuelva el área.

<details>
<summary>Ver solución</summary>

```python
def area_rectangulo(base, altura):
    return base * altura

print(area_rectangulo(4, 3))   # 12
```

</details>

### 2. ¿Es primo?

Crea una función `es_primo(n)` que devuelva `True` si `n` es primo y `False` si no. Úsala para mostrar los primos del 1 al 50.

<details>
<summary>Ver solución</summary>

```python
def es_primo(n):
    if n < 2:
        return False
    for divisor in range(2, n):
        if n % divisor == 0:
            return False
    return True

primos = []
for numero in range(1, 51):
    if es_primo(numero):
        primos.append(numero)

print(primos)
```

</details>

### 3. Estadísticas de notas

Crea una función `resumen_notas(notas)` que reciba una lista de notas y devuelva un diccionario con la media (redondeada a 2 decimales), la nota máxima, la mínima y el número de aprobados.

<details>
<summary>Ver solución</summary>

```python
def resumen_notas(notas):
    aprobados = 0
    for nota in notas:
        if nota >= 5:
            aprobados += 1

    return {
        "media": round(sum(notas) / len(notas), 2),
        "maxima": max(notas),
        "minima": min(notas),
        "aprobados": aprobados,
    }

print(resumen_notas([7.5, 4.0, 9.25, 6.0, 3.5]))
```

</details>

### 4. Palíndromos

Crea una función `es_palindromo(texto)` que indique si un texto se lee igual al derecho que al revés, ignorando mayúsculas y espacios. Prueba con `"Anita lava la tina"`.

<details>
<summary>Ver solución</summary>

```python
def es_palindromo(texto):
    limpio = texto.lower().replace(" ", "")
    return limpio == limpio[::-1]

print(es_palindromo("Anita lava la tina"))  # True
print(es_palindromo("Python"))              # False
```

</details>

### 5. Calculadora interactiva

Crea una función `calcular(a, b, operacion)` que haga `+`, `-`, `*` o `/` (y avise si se divide entre 0). Después, pide al usuario los dos números y la operación con `input` en un bucle hasta que escriba `salir`.

<details>
<summary>Ver solución</summary>

```python
def calcular(a, b, operacion):
    if operacion == "+":
        return a + b
    elif operacion == "-":
        return a - b
    elif operacion == "*":
        return a * b
    elif operacion == "/":
        if b == 0:
            return "No se puede dividir entre 0"
        return a / b
    return "Operación no válida"

while True:
    operacion = input("Operación (+, -, *, /) o 'salir': ")
    if operacion == "salir":
        break
    a = float(input("Primer número: "))
    b = float(input("Segundo número: "))
    print("Resultado:", calcular(a, b, operacion))
```

</details>

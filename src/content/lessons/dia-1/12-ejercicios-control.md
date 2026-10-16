---
title: "Ejercicios: datos y control de flujo"
day: 1
order: 12
minutes: 4
---

Haz en clase el **1** y el **2**. El resto, para practicar en casa. Cada ejercicio tiene un editor con los datos de partida: escribe ahí tu solución y ejecútala. Intenta resolverlos **antes** de mirar la solución.

### 1. Par o impar

Dado un número guardado en una variable, muestra si es par o impar.

```python
numero = 17

# Escribe aquí tu solución
```

<details>
<summary>Ver solución</summary>

```python
numero = 17

if numero % 2 == 0:
    print(f"{numero} es par")
else:
    print(f"{numero} es impar")
```

</details>

### 2. Tabla de multiplicar

Muestra la tabla de multiplicar del 9 (del 9 × 1 al 9 × 10).

```python
numero = 9

# Escribe aquí tu solución
```

<details>
<summary>Ver solución</summary>

```python
numero = 9

for i in range(1, 11):
    print(f"{numero} x {i} = {numero * i}")
```

</details>

### 3. Contar vocales

Cuenta cuántas vocales tiene la frase `"La Universidad de León fue fundada en 1979"`.

```python
frase = "La Universidad de León fue fundada en 1979"
vocales = "aeiouáéíóú"

# Escribe aquí tu solución
```

<details>
<summary>Ver solución</summary>

```python
frase = "La Universidad de León fue fundada en 1979"
vocales = "aeiouáéíóú"

contador = 0
for letra in frase.lower():
    if letra in vocales:
        contador += 1

print(f"Hay {contador} vocales")
```

</details>

### 4. Notas de clase

Con este diccionario, muestra el nombre de cada alumno con su calificación (Suspenso, Aprobado, Notable o Sobresaliente) y, al final, cuántos han aprobado.

```python
notas = {"Ana": 8.5, "Pablo": 4.2, "Marta": 9.6, "Hugo": 6.1, "Sara": 3.9}

# Escribe aquí tu solución
```

<details>
<summary>Ver solución</summary>

```python
notas = {"Ana": 8.5, "Pablo": 4.2, "Marta": 9.6, "Hugo": 6.1, "Sara": 3.9}
aprobados = 0

for nombre, nota in notas.items():
    if nota < 5:
        calificacion = "Suspenso"
    elif nota < 7:
        calificacion = "Aprobado"
    elif nota < 9:
        calificacion = "Notable"
    else:
        calificacion = "Sobresaliente"

    if nota >= 5:
        aprobados += 1

    print(f"{nombre}: {nota} ({calificacion})")

print(f"Han aprobado {aprobados} de {len(notas)}")
```

</details>

### 5. Adivina el número

El programa "piensa" un número del 1 al 100 y el usuario intenta adivinarlo. Tras cada intento, indica si el número secreto es mayor o menor. Al acertar, muestra cuántos intentos ha necesitado.

> **Pista:** `import random` y `random.randint(1, 100)` generan un número aleatorio.

```python
import random

secreto = random.randint(1, 100)

# Escribe aquí tu solución
```

<details>
<summary>Ver solución</summary>

```python
import random

secreto = random.randint(1, 100)
intentos = 0
acertado = False

while not acertado:
    intento = int(input("Di un número del 1 al 100: "))
    intentos += 1

    if intento < secreto:
        print("Es mayor ⬆️")
    elif intento > secreto:
        print("Es menor ⬇️")
    else:
        acertado = True

print(f"¡Correcto! Lo has adivinado en {intentos} intentos")
```

</details>

---
title: "Proyecto: formas geométricas"
day: 2
order: 8
minutes: 13
---

## Enunciado

Crea una clase base `Forma` y tres clases hijas: `Circulo`, `Rectangulo` y `Triangulo`. Cada una debe calcular su **área** y su **perímetro**:

| Forma | Datos que recibe | Área | Perímetro |
|-------|------------------|------|-----------|
| Círculo | diámetro | π · r² (con r = diámetro / 2) | π · diámetro |
| Rectángulo | base y altura | base · altura | 2 · (base + altura) |
| Triángulo (isósceles) | base y altura | base · altura / 2 | base + 2 · lado |

Para el perímetro del triángulo necesitamos sus lados. Si suponemos que es **isósceles** (los dos lados iguales), por el teorema de Pitágoras cada lado mide √((base/2)² + altura²).

> **Pista:** `import math` te da `math.pi` y `math.sqrt()`. Es tu primer contacto con la **biblioteca estándar**: módulos que vienen con Python pero hay que importar.

Intenta hacerlo por tu cuenta antes de mirar la solución. Empieza por la clase `Forma`: ¿qué tienen en común todas las formas?

## Pasos sugeridos

1. Define `Forma` con un atributo `nombre` y los métodos `area()` y `perimetro()`. Como no sabemos calcularlos para una forma genérica, que lancen `NotImplementedError`.
2. Añade a `Forma` un método `describir()` que devuelva un texto con el nombre, el área y el perímetro (redondeados a 2 decimales).
3. Crea las tres clases hijas, cada una con su `__init__` (usando `super()`) y sus fórmulas.
4. Crea una lista con varias formas, recórrela y muestra la descripción de cada una.
5. **Extra:** muestra cuál es la forma con mayor área.

```python
import math


class Forma:
    def __init__(self, nombre):
        self.nombre = nombre

    def area(self):
        raise NotImplementedError("Cada forma debe implementar area()")

    def perimetro(self):
        raise NotImplementedError("Cada forma debe implementar perimetro()")

    def describir(self):
        # Devuelve un texto con el nombre, el área y el perímetro
        pass


class Circulo(Forma):
    def __init__(self, diametro):
        super().__init__("Círculo")
        self.diametro = diametro

    # Completa area() y perimetro()


# Crea aquí las clases Rectangulo y Triangulo


formas = [Circulo(10)]

for forma in formas:
    print(forma.describir())
```

<details>
<summary>Ver solución</summary>

```python
import math


class Forma:
    def __init__(self, nombre):
        self.nombre = nombre

    def area(self):
        raise NotImplementedError("Cada forma debe implementar area()")

    def perimetro(self):
        raise NotImplementedError("Cada forma debe implementar perimetro()")

    def describir(self):
        return (
            f"{self.nombre}: área = {self.area():.2f}, "
            f"perímetro = {self.perimetro():.2f}"
        )


class Circulo(Forma):
    def __init__(self, diametro):
        super().__init__("Círculo")
        self.diametro = diametro

    def radio(self):
        return self.diametro / 2

    def area(self):
        return math.pi * self.radio() ** 2

    def perimetro(self):
        return math.pi * self.diametro


class Rectangulo(Forma):
    def __init__(self, base, altura):
        super().__init__("Rectángulo")
        self.base = base
        self.altura = altura

    def area(self):
        return self.base * self.altura

    def perimetro(self):
        return 2 * (self.base + self.altura)


class Triangulo(Forma):
    """Triángulo isósceles definido por su base y su altura."""

    def __init__(self, base, altura):
        super().__init__("Triángulo")
        self.base = base
        self.altura = altura

    def lado(self):
        return math.sqrt((self.base / 2) ** 2 + self.altura ** 2)

    def area(self):
        return self.base * self.altura / 2

    def perimetro(self):
        return self.base + 2 * self.lado()


formas = [
    Circulo(10),
    Rectangulo(4, 6),
    Triangulo(6, 4),
]

for forma in formas:
    print(forma.describir())

mayor = max(formas, key=lambda f: f.area())
print(f"La forma con mayor área es: {mayor.nombre}")
```

Salida:

```text
Círculo: área = 78.54, perímetro = 31.42
Rectángulo: área = 24.00, perímetro = 20.00
Triángulo: área = 12.00, perímetro = 16.00
La forma con mayor área es: Círculo
```

</details>

## Retos extra

- Añade una clase `Cuadrado` que herede de `Rectangulo` (¡solo necesita un dato!).
- Haz que el programa pida al usuario qué forma quiere y sus medidas con `input()`.
- Valida los datos: si alguna medida es negativa o cero, lanza un `ValueError`.

> **🔗 Para mañana:** fíjate en que nuestras clases tienen atributos con tipos concretos (números, textos…). Mañana usaremos **Pydantic**, una librería que crea clases así y además **valida** automáticamente los datos. Es justo lo que necesitaremos para que una IA nos devuelva información ordenada.

# Python en 3 días · ULE

Web del curso introductorio de Python para estudiantes de 1.º de la Universidad de León. Tres sesiones de una hora:

| Día | Tema | Proyecto |
|-----|------|----------|
| 1 | Fundamentos: tipos de datos, control de flujo y funciones | 10 ejercicios con solución |
| 2 | Programación orientada a objetos | Formas geométricas con herencia |
| 3 | IA en tus programas con Pydantic AI | Asistente de estudio (resúmenes y tests) |

Los alumnos trabajan en [Google Colab](https://colab.research.google.com), sin instalar nada.

## Desarrollo

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # genera la web estática en ./dist
npm run preview
```

## Estructura

```text
src/
├── content/lessons/      # Un archivo Markdown por tema
│   ├── dia-1/
│   ├── dia-2/
│   └── dia-3/
├── content.config.ts     # Esquema de los temas (title, day, order, minutes)
├── data/days.ts          # Título y objetivo de cada día
├── components/Navbar.astro
├── layouts/Base.astro
└── pages/
    ├── index.astro       # Portada
    └── dia/[day].astro   # Temario a la izquierda, contenido a la derecha
```

### Añadir o editar un tema

Crea un `.md` en la carpeta del día con este *frontmatter*:

```md
---
title: Título del tema
day: 1
order: 16          # posición en la lista
minutes: 5         # duración estimada (se suma en el total del día)
---
```

Las soluciones de los ejercicios van dentro de `<details><summary>Ver solución</summary> … </details>` (dejando líneas en blanco alrededor del bloque de código).

## Notas para el profesor

- **Ritmo del día 1:** es el día más denso. Los minutos están ajustados a 60; en clase se hacen 2 + 1 ejercicios y el resto queda para casa.
- **Día 3, antes de clase:** pide a los alumnos que creen su clave gratuita en [Google AI Studio](https://aistudio.google.com/apikey) (requiere ser mayor de edad). Ten preparada una clave de respaldo por si alguien no puede.
- **Pydantic AI v2:** el modelo se indica como `google:gemini-2.5-flash` (el antiguo prefijo `google-gla:` ya no existe) y en Colab hay que usar `await agente.run(...)` en lugar de `run_sync`.
- Si Google retira `gemini-2.5-flash`, basta con cambiar la variable `MODELO` por el modelo *flash* vigente.

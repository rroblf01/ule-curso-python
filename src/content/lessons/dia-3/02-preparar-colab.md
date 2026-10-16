---
title: Preparar Colab y la clave de API
day: 3
order: 2
minutes: 7
---

Usaremos **Google Gemini** porque ofrece un **nivel gratuito** suficiente para este curso y no hace falta tarjeta de crédito.

## 1. Conseguir una clave de API gratuita

1. Entra en [Google AI Studio](https://aistudio.google.com/apikey) con tu cuenta de Google.
2. Acepta las condiciones de uso.
3. Pulsa **Create API key** (Crear clave de API) y cópiala.

> **⚠️ Tu clave es como una contraseña.** No la pegues en el código, no la subas a GitHub y no la compartas. Si alguien la consigue, puede gastar tu cuota en tu nombre.

> **Nota:** Google AI Studio requiere ser mayor de edad. Si no puedes crear una clave, haz el ejercicio en pareja con un compañero.

## 2. Guardarla en los "Secretos" de Colab

Colab tiene un lugar seguro para las claves, separado del código:

1. Abre un cuaderno nuevo en [colab.new](https://colab.new).
2. En la barra lateral izquierda, pulsa el icono de la **llave 🔑** (*Secretos*).
3. Pulsa **Añadir nuevo secreto**.
4. Nombre: `GOOGLE_API_KEY`. Valor: pega tu clave.
5. Activa el interruptor **Acceso desde el cuaderno**.

## 3. Instalar Pydantic AI

En la primera celda del cuaderno (el `!` del principio ejecuta un comando del sistema en lugar de Python):

```python
!pip install -q "pydantic-ai-slim[google]"
```

`pydantic-ai-slim[google]` instala Pydantic AI solo con lo necesario para usar Gemini. Tarda unos segundos.

## 4. Cargar la clave

```python
import os
from google.colab import userdata

os.environ["GOOGLE_API_KEY"] = userdata.get("GOOGLE_API_KEY")
os.environ["PYDANTIC_AI_NO_BANNER"] = "1"   # oculta el mensaje informativo de la librería

MODELO = "google:gemini-2.5-flash"
```

Pydantic AI busca la clave automáticamente en la variable de entorno `GOOGLE_API_KEY`, así que no tendremos que volver a escribirla.

Guardamos el nombre del modelo en la variable `MODELO` para poder cambiarlo en un solo sitio. El formato es `"proveedor:modelo"`.

> **💡 Si el modelo da error** porque ya no existe o has agotado la cuota gratuita, prueba con otro modelo *flash* de los que aparezcan en Google AI Studio (por ejemplo, `"google:gemini-2.5-flash-lite"`).

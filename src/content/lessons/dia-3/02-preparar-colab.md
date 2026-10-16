---
title: "Preparar Colab: GPU y Ollama"
day: 3
order: 2
minutes: 8
---

Vamos a montar nuestro propio "servidor de IA" dentro de Colab. Sin claves, sin cuentas de pago.

## 1. Activar la GPU

1. Abre un cuaderno nuevo en [colab.new](https://colab.new).
2. Menú **Entorno de ejecución → Cambiar tipo de entorno de ejecución**.
3. En *Acelerador por hardware*, elige **GPU T4** y pulsa **Guardar**.

Comprueba que la tienes:

```python
!nvidia-smi
```

Deberías ver una tabla con **Tesla T4** y unos 15 GB de memoria.

## 2. La celda de preparación

Copia **esta celda entera** y ejecútala. Tarda unos 2-3 minutos (la mayor parte es descargar el modelo, de unos 5 GB):

```python
# 1. Instalar Ollama
!apt-get -qq update > /dev/null && apt-get -qq install -y zstd > /dev/null
!curl -fsSL https://ollama.com/install.sh | sh

# 2. Arrancar el servidor de Ollama en segundo plano
import subprocess, time
servidor = subprocess.Popen(["ollama", "serve"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(5)

# 3. Descargar el modelo
!ollama pull qwen3:8b

# 4. Instalar Pydantic AI (con soporte para Ollama)
!pip install -q "pydantic-ai-slim[openai]"
```

¿Qué hace cada parte?

- Las líneas que empiezan por `!` ejecutan **comandos del sistema** (Linux), no Python.
- `ollama serve` arranca el servidor. Lo lanzamos con `subprocess.Popen` para que siga funcionando **en segundo plano** mientras usamos el cuaderno.
- `ollama pull qwen3:8b` descarga el modelo **Qwen 3** de 8 mil millones de parámetros (*8b*). Cabe de sobra en la GPU T4.
- `pydantic-ai-slim[openai]`: Ollama "habla" el mismo idioma (API) que OpenAI, por eso instalamos ese complemento.

> **💡 Puede que veas avisos** como *"systemd is not running"* o *"Unable to detect NVIDIA/AMD GPU"*. Son normales en Colab: los controladores de la GPU ya vienen instalados.

## 3. Configurar Pydantic AI

En una celda nueva:

```python
import os

os.environ["OLLAMA_BASE_URL"] = "http://localhost:11434/v1"
os.environ["PYDANTIC_AI_NO_BANNER"] = "1"   # oculta el mensaje informativo de la librería

MODELO = "ollama:qwen3:8b"
```

- `OLLAMA_BASE_URL` le dice a Pydantic AI **dónde** está el servidor: en la propia máquina (`localhost`), puerto `11434`.
- Guardamos el nombre del modelo en la variable `MODELO` para poder cambiarlo en un solo sitio. El formato es `"proveedor:modelo"`.

## Si algo falla

| Problema | Solución |
|----------|----------|
| `nvidia-smi` no encuentra la GPU | No has activado la GPU (paso 1), o Colab no tiene GPUs libres ahora mismo. Prueba en unos minutos. |
| *Connection refused* al usar el modelo | El servidor no está arrancado. Vuelve a ejecutar la celda de preparación. |
| Va muy lento | Comprueba con `!ollama ps` que la columna *PROCESSOR* dice **100% GPU**. |
| Colab se ha desconectado | Las sesiones gratuitas se reinician tras un rato de inactividad y **se pierde todo lo instalado**. Vuelve a ejecutar la celda de preparación. |

> **¿Sin GPU disponible?** Puedes usar un modelo más pequeño en la CPU (`qwen3:1.7b`), aunque será más lento y cometerá más errores. O usar un modelo en la nube con clave de API: lo vemos en el último tema.

"""Python engine for the course editors.

Runs inside a PyScript (Pyodide) worker. The main thread calls the functions
registered on `sync` at the bottom of this file, and the worker calls back into
the main thread through `sync.write` (output) and `sync.ask` (input()).
"""

import ast
import builtins
import json
import linecache
import os
import re
import sys
import time
import traceback

import pyodide_js
from pyodide.ffi import jsnull
from pyscript import sync

os.environ["TERM"] = "dumb"

NS = {}
_block_counter = 0
_jedi = None
_last_completions = []


def reset():
    """Forget every variable, function and class defined by the students."""
    NS.clear()
    NS["__name__"] = "__main__"
    NS["__builtins__"] = builtins
    return "ok"


reset()


# --------------------------------------------------------------------------
# Output and input
# --------------------------------------------------------------------------


class _Stream:
    """File-like object that forwards text to the main thread in small batches."""

    def __init__(self, name):
        self.name = name
        self._buffer = []
        self._size = 0
        self._last_flush = time.monotonic()

    def write(self, text):
        text = str(text)
        if not text:
            return 0
        self._buffer.append(text)
        self._size += len(text)
        if self._size > 4096 or time.monotonic() - self._last_flush > 0.05:
            self.flush()
        return len(text)

    def flush(self):
        if self._buffer:
            sync.write(self.name, "".join(self._buffer))
            self._buffer.clear()
            self._size = 0
        self._last_flush = time.monotonic()

    def isatty(self):
        return False


_stdout = _Stream("stdout")
_stderr = _Stream("stderr")
sys.stdout = _stdout
sys.stderr = _stderr


def _flush_all():
    _stdout.flush()
    _stderr.flush()


def _input(prompt=""):
    _flush_all()
    value = sync.ask(str(prompt))
    if value is None or value is jsnull:
        raise KeyboardInterrupt
    return str(value)


builtins.input = _input

try:
    import pydoc

    pydoc.pager = pydoc.plainpager
except Exception:  # pragma: no cover - pydoc is optional
    pass


# --------------------------------------------------------------------------
# Error explanations in Spanish
# --------------------------------------------------------------------------

_SYNTAX_HINTS = [
    (r"expected ':'", "Falta `:` al final de la línea. Después de `if`, `elif`, `else`, `for`, `while`, `def` o `class` siempre van dos puntos."),
    (r"unterminated (triple-quoted )?string", "Has abierto unas comillas y no las has cerrado. Revisa que cada texto empiece y termine con el mismo tipo de comillas."),
    (r"was never closed", "Hay un paréntesis, corchete o llave que se abre pero no se cierra."),
    (r"unmatched '[\)\]\}]'", "Sobra un paréntesis, corchete o llave de cierre."),
    (r"does not match opening parenthesis", "Los paréntesis, corchetes o llaves no están bien emparejados."),
    (r"Maybe you meant '==' or ':=' instead of '='", "Para **comparar** se usa `==`. El signo `=` sirve para **asignar** un valor a una variable."),
    (r"invalid decimal literal", "Los nombres de variable no pueden empezar por un número, y entre un número y una letra falta un operador."),
    (r"cannot assign to (literal|expression|function call)", "A la izquierda del `=` debe haber un nombre de variable. Si querías comparar, usa `==`."),
    (r"Perhaps you forgot a comma", "Parece que falta una coma entre dos elementos."),
    (r"invalid character", "Hay un carácter que Python no reconoce. Suele pasar al copiar comillas tipográficas (“ ”) en lugar de comillas normales (\")."),
    (r"'return' outside function", "`return` solo puede usarse dentro de una función (`def`)."),
    (r"'break' outside loop|'continue' not properly in loop", "`break` y `continue` solo pueden usarse dentro de un bucle `for` o `while`."),
    (r"expected 'except' or 'finally' block", "Después de un bloque `try` tiene que haber un `except` o un `finally`."),
    (r"f-string", "Hay un error dentro de un f-string. Revisa las llaves `{}` y las comillas."),
]

_INDENT_HINTS = [
    (r"expected an indented block", "Después de una línea que termina en `:` las siguientes líneas del bloque deben ir **sangradas** (4 espacios o la tecla Tab)."),
    (r"unexpected indent", "Esta línea tiene sangría de más. Solo se sangra dentro de un bloque (después de `:`)."),
    (r"unindent does not match", "La sangría de esta línea no coincide con la de las líneas anteriores. Usa siempre 4 espacios por nivel."),
]


def _suggestion(text):
    match = re.search(r"Did you mean: '?([^'?]+)'?\?", text)
    return match.group(1) if match else None


def _hint(exc, summary):
    """Return a short explanation in Spanish for the most common errors."""
    name = type(exc).__name__
    msg = str(exc)
    suggestion = _suggestion(summary)
    extra = f" ¿Quizás querías decir `{suggestion}`?" if suggestion else ""

    if name == "ValidationError":
        return "Pydantic ha rechazado los datos porque no cumplen los tipos o restricciones del modelo. Abre el mensaje original para ver qué campo falla."
    if isinstance(exc, IndentationError):
        for pattern, text in _INDENT_HINTS:
            if re.search(pattern, msg):
                return text
        return "La sangría (los espacios al principio de la línea) no es correcta."
    if isinstance(exc, SyntaxError):
        for pattern, text in _SYNTAX_HINTS:
            if re.search(pattern, msg):
                return text
        return "Python no entiende cómo está escrita esta línea. Revisa paréntesis, comillas, comas y dos puntos."
    if isinstance(exc, NameError):
        match = re.search(r"name '(\w+)' is not defined", msg)
        var = match.group(1) if match else "?"
        if var in ("true", "false", "none", "TRUE", "FALSE", "NONE"):
            return f"En Python se escribe con la primera letra en mayúscula: `{var.capitalize()}`."
        if isinstance(exc, UnboundLocalError):
            return f"Usas `{var}` dentro de la función antes de darle un valor. Si es una variable de fuera, pásala como parámetro."
        return (
            f"`{var}` no existe todavía.{extra} Revisa que esté bien escrito (Python distingue mayúsculas) "
            "y que hayas ejecutado antes el bloque donde se crea."
        )
    if isinstance(exc, TypeError):
        if "can only concatenate str" in msg or ("unsupported operand" in msg and "'str'" in msg):
            return "No se pueden sumar textos y números directamente. Convierte el número con `str(numero)`, el texto con `int(texto)`, o usa un f-string: `f\"Tengo {edad} años\"`."
        if "not callable" in msg:
            what = re.search(r"'(\w+)' object", msg)
            return (
                f"Estás usando un valor de tipo `{what.group(1) if what else '?'}` como si fuera una función (con paréntesis). "
                "¿Has guardado algo en una variable con el mismo nombre que una función, como `sum = 10`?"
            )
        if "missing" in msg and "required positional argument" in msg:
            return "Al llamar a la función faltan argumentos. Revisa cuántos parámetros tiene en su `def`."
        if "positional argument" in msg and "were given" in msg:
            return "Le pasas más argumentos de los que acepta. Si es un método de una clase, ¿te falta `self` como primer parámetro en el `def`?"
        if "does not support item assignment" in msg:
            if "'tuple'" in msg:
                return "Las tuplas no se pueden modificar. Si necesitas cambiar elementos, usa una lista."
            if "'str'" in msg:
                return "Las cadenas no se pueden modificar letra a letra. Crea una cadena nueva, por ejemplo con `replace()` o con trozos `texto[:3]`."
        if "not subscriptable" in msg:
            return "Estás usando corchetes `[]` sobre un valor que no es una lista, cadena, tupla ni diccionario."
        if "not iterable" in msg:
            return "`for` solo puede recorrer colecciones (listas, cadenas, rangos…). Para repetir un número de veces usa `range(n)`."
        if "unexpected keyword argument" in msg:
            return "Has usado un nombre de parámetro que la función no tiene."
        return "Estás usando un valor de un tipo que no encaja con la operación. Comprueba los tipos con `type(valor)`."
    if isinstance(exc, ZeroDivisionError):
        return "Has dividido entre cero, y eso no está definido. Comprueba el divisor antes de dividir."
    if isinstance(exc, IndexError):
        return "Intentas acceder a una posición que no existe. Recuerda que se empieza a contar en 0 y que la última posición es `len(lista) - 1`."
    if isinstance(exc, KeyError):
        return f"La clave {msg} no existe en el diccionario. Comprueba antes con `in` o usa `.get(clave)`."
    if isinstance(exc, ValueError):
        if "invalid literal for int()" in msg or "could not convert string to float" in msg:
            return "Ese texto no se puede convertir a número. Asegúrate de escribir solo cifras (y punto para los decimales)."
        if "not in list" in msg:
            return "Ese elemento no está en la lista. Comprueba antes con `elemento in lista`."
        if "too many values to unpack" in msg or "not enough values to unpack" in msg:
            return "El número de variables a la izquierda del `=` no coincide con el número de valores."
        return "El tipo del valor es correcto, pero su contenido no es válido para esta operación."
    if isinstance(exc, AttributeError):
        match = re.search(r"'(\w+)' object has no attribute '(\w+)'", msg)
        if match:
            return (
                f"Los valores de tipo `{match.group(1)}` no tienen `{match.group(2)}`.{extra} "
                "Escribe el punto y pulsa Ctrl+Espacio para ver las opciones disponibles."
            )
        return f"Ese objeto no tiene ese atributo o método.{extra}"
    if isinstance(exc, ModuleNotFoundError):
        return "Ese módulo no está disponible en el navegador. Para módulos externos usa Google Colab."
    if isinstance(exc, RecursionError):
        return "La función se llama a sí misma sin parar. ¿Le falta el caso base que detiene la recursión?"
    if isinstance(exc, NotImplementedError):
        return "Este método no está implementado. Si viene de una clase padre, la clase hija debe definirlo."
    if isinstance(exc, AssertionError):
        return "Una comprobación con `assert` ha fallado."
    return None


def _error_payload(exc, filename):
    te = traceback.TracebackException.from_exception(exc, capture_locals=False)
    te.stack = traceback.StackSummary.from_list(
        [frame for frame in te.stack if frame.filename.startswith("<bloque")]
    )
    te.__cause__ = None
    te.__context__ = None
    summary = "".join(te.format_exception_only()).strip()
    line = col = None
    if isinstance(exc, SyntaxError):
        if exc.filename == filename:
            line, col = exc.lineno, exc.offset
    else:
        for frame in reversed(te.stack):
            if frame.filename == filename:
                line = frame.lineno
                break
    return {
        "type": type(exc).__name__,
        "summary": summary,
        "traceback": "".join(te.format()).strip(),
        "hint": _hint(exc, summary),
        "line": line,
        "col": col,
    }


# --------------------------------------------------------------------------
# Running code
# --------------------------------------------------------------------------


def _short_repr(value):
    text = repr(value)
    return text if len(text) <= 5000 else text[:5000] + " …"


async def run(code):
    """Run a block of code like a notebook cell and report how it ended."""
    global _block_counter
    _block_counter += 1
    filename = f"<bloque {_block_counter}>"
    linecache.cache[filename] = (len(code), None, code.splitlines(True), filename)

    try:
        await pyodide_js.loadPackagesFromImports(code)
    except Exception:
        pass

    result = {"status": "ok", "error": None}
    try:
        tree = ast.parse(code, filename)
        for node in tree.body:
            is_comment = isinstance(node, ast.Expr) and isinstance(node.value, ast.Constant) and isinstance(node.value.value, str)
            if isinstance(node, ast.Expr) and not is_comment:
                value = eval(compile(ast.Expression(node.value), filename, "eval"), NS)
                if value is not None:
                    _flush_all()
                    sync.write("result", _short_repr(value))
            else:
                exec(compile(ast.Module([node], []), filename, "exec"), NS)
    except KeyboardInterrupt:
        result["status"] = "interrupted"
    except SystemExit:
        result["status"] = "exit"
    except BaseException as exc:  # noqa: BLE001 - every error is reported to the student
        result["status"] = "error"
        result["error"] = _error_payload(exc, filename)
    finally:
        _flush_all()
    return json.dumps(result)


def check(code):
    """Report the first syntax error of a block (used for live linting)."""
    try:
        ast.parse(code, "<bloque comprobación>")
    except SyntaxError as exc:
        summary = f"{type(exc).__name__}: {exc.msg}"
        return json.dumps(
            {
                "line": exc.lineno,
                "col": exc.offset,
                "end_line": getattr(exc, "end_lineno", None),
                "end_col": getattr(exc, "end_offset", None),
                "summary": summary,
                "hint": _hint(exc, summary),
            }
        )
    return "null"


def set_interrupt_buffer(buffer):
    pyodide_js.setInterruptBuffer(buffer)
    return "ok"


# --------------------------------------------------------------------------
# Editor assistance with jedi
# --------------------------------------------------------------------------


async def _load_jedi():
    global _jedi
    if _jedi is None:
        await pyodide_js.loadPackage("jedi")
        import jedi

        jedi.settings.case_insensitive_completion = False
        _jedi = jedi
    return _jedi


def _script(code):
    return _jedi.Interpreter(code, [NS])


async def warmup():
    jedi = await _load_jedi()
    jedi.Interpreter("pri", [NS]).complete(1, 3)
    return "ok"


def _first_paragraph(text, limit=700):
    text = (text or "").strip()
    paragraph = text.split("\n\n")[0].strip()
    return paragraph if len(paragraph) <= limit else paragraph[:limit] + " …"


async def complete(code, line, col):
    global _last_completions
    await _load_jedi()
    completions = _script(code).complete(line, col)[:200]
    _last_completions = completions
    return json.dumps(
        [
            {"name": c.name, "type": c.type, "full_name": c.full_name or ""}
            for c in completions
            if not c.name.startswith("__") or c.name in ("__init__", "__str__")
        ]
    )


def completion_doc(name):
    for completion in _last_completions:
        if completion.name == name:
            try:
                signatures = completion.get_signatures()
                signature = signatures[0].to_string() if signatures else ""
                doc = completion.docstring(raw=True)
                return json.dumps({"signature": signature, "doc": _first_paragraph(doc)})
            except Exception:
                return "null"
    return "null"


async def signatures(code, line, col):
    await _load_jedi()
    found = _script(code).get_signatures(line, col)
    if not found:
        return "null"
    signature = found[0]
    return json.dumps(
        {
            "name": signature.name,
            "full_name": signature.full_name or "",
            "params": [param.to_string() for param in signature.params],
            "index": signature.index,
            "doc": _first_paragraph(signature.docstring(raw=True), 300),
        }
    )


async def describe(code, line, col):
    await _load_jedi()
    names = _script(code).infer(line, col) or _script(code).goto(line, col)
    if not names:
        return "null"
    name = names[0]
    try:
        found = name.get_signatures()
        signature = found[0].to_string() if found else ""
    except Exception:
        signature = ""
    return json.dumps(
        {
            "name": name.name,
            "full_name": name.full_name or "",
            "type": name.type,
            "signature": signature,
            "doc": _first_paragraph(name.docstring(raw=True)),
        }
    )


sync.run = run
sync.check = check
sync.reset = reset
sync.set_interrupt_buffer = set_interrupt_buffer
sync.warmup = warmup
sync.complete = complete
sync.completion_doc = completion_doc
sync.signatures = signatures
sync.describe = describe

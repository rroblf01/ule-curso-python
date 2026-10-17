# Stage 1: build the site
FROM oven/bun:1.4.3-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN bun install

COPY . .
RUN bun run build

# Pre-compress text files: gofly serves the .gz sibling when the browser accepts
# gzip (precompressed: true by default), so nothing is compressed per request.
# .wasm/.mjs are the Python runtime (pyodide.asm.wasm: 9.6 MB -> 3.5 MB). Not
# compressed: .zip/.whl (already compressed) and .py (gofly has no MIME type for
# it and would label the .gz as application/x-gzip; runner.py is only 8 KB).
RUN find /app/dist -type f \( -name "*.html" -o -name "*.css" -o -name "*.js" -o -name "*.mjs" \
      -o -name "*.json" -o -name "*.svg" -o -name "*.wasm" -o -name "*.txt" -o -name "*.xml" \) \
    -exec gzip -9 -k {} \;

# Stage 2: convert nginx.conf into gofly's config.json (needs a shell, the runtime image has none)
FROM alpine:3 AS config

COPY --from=ghcr.io/rroblf01/gofly:1.3.1 /gofly /gofly
COPY nginx.conf /nginx.conf

# Warnings print to the build log; `-t` fails the build if the result is invalid.
# No write_timeout on purpose: an explicit one would cap the total time of a slow
# download of the ~24 MB Python runtime; send_timeout (nginx.conf) handles stalls.
RUN /gofly -convert /nginx.conf > /config.json \
    && ! grep -q '"write_timeout"' /config.json \
    && /gofly -t -config /config.json

# Stage 3: production image
FROM ghcr.io/rroblf01/gofly:1.3.1

COPY --from=config /config.json /etc/gofly/config.json
COPY --from=builder /app/dist/ /www/

EXPOSE 80
CMD ["-config", "/etc/gofly/config.json"]

# Stage 1: Build
FROM oven/bun:1.4.3-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN bun install --frozen-lockfile

COPY . .

RUN bun run build

# Precompress text assets so gofly serves .gz directly (precompressed: true)
RUN find /app/dist -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" -o -name "*.json" -o -name "*.svg" -o -name "*.xml" -o -name "*.txt" -o -name "*.webmanifest" \) \
    -exec gzip -9 -k {} \;

COPY --from=ghcr.io/rroblf01/gofly:1.2.0 /gofly /gofly

# Stage 2: Production
FROM ghcr.io/rroblf01/gofly:1.2.0

COPY --from=builder /app/dist/ /www/

EXPOSE 80
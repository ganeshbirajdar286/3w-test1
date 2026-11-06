# ==========================================
# Stage 1: Build & Dependencies
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Monorepo compatibility symlinks for parent-relative imports (e.g. "../backend/...")
RUN ln -s /app /backend 2>/dev/null || true && \
    ln -s /app /server 2>/dev/null || true && \
    ln -s /app /api 2>/dev/null || true && \
    ln -s /app /app/backend 2>/dev/null || true && \
    ln -s /app /app/server 2>/dev/null || true && \
    ln -s /app /app/api 2>/dev/null || true


# Prune dev dependencies for production image
RUN npm prune --production

# ==========================================
# Stage 2: Production Minimal Runner
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

COPY --chown=node:node --from=builder /app/package.json ./package.json
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app ./

# Monorepo compatibility symlinks for parent-relative imports (e.g. "../backend/...")
RUN ln -s /app /backend 2>/dev/null || true && \
    ln -s /app /server 2>/dev/null || true && \
    ln -s /app /api 2>/dev/null || true && \
    ln -s /app /app/backend 2>/dev/null || true && \
    ln -s /app /app/server 2>/dev/null || true && \
    ln -s /app /app/api 2>/dev/null || true

# Run as non-root built-in node user
USER node

EXPOSE 5000

CMD ["npm", "run", "start"]
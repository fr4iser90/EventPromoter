# Multi-stage build for Backend
# Build context is root directory
# Stage 1: Build
FROM node:20-alpine AS builder

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate
# Install pnpm directly via npm (more reliable than corepack)
# RUN npm install -g pnpm@10.24.0

WORKDIR /app

# Copy root package.json and pnpm workspace config
COPY package*.json ./
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./

# Copy backend package.json
COPY backend/package*.json ./backend/
COPY packages/types/package*.json ./packages/types/

# Install dependencies with pnpm (works better with workspaces)
# Include devDependencies for build tools like tsc
RUN pnpm install --frozen-lockfile

# Copy backend source code
COPY backend/ ./backend/
COPY packages/types/ ./packages/types/

# Copy config directory
COPY config/ ./config/

# Build TypeScript (from root, using workspace filter)
# pnpm resolves binaries from root node_modules in workspace setup
WORKDIR /app
RUN pnpm --filter @eventpromoter/types run build && \
    pnpm --filter @eventpromoter/backend run build

# Stage 2: Production
FROM node:20-alpine

# Install pnpm directly via npm (more reliable than corepack)
RUN npm install -g pnpm@10.24.0

# ✅ Create non-root user (UID/GID 1001 - node:alpine verwendet bereits 1000)
RUN addgroup -g 1001 nodeuser && \
    adduser -D -u 1001 -G nodeuser nodeuser

WORKDIR /app

# Copy root package.json and pnpm workspace config
COPY package*.json ./
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./

# Copy backend package.json
COPY backend/package*.json ./backend/
COPY packages/types/package*.json ./packages/types/

# Install dependencies with pnpm - need all for jsdom to work correctly
# jsdom has ES module dependencies that require full install
RUN pnpm install --prod=false --frozen-lockfile

# Copy compiled shared workspace package so Node loads JS (not TS) at runtime
COPY --from=builder /app/packages/types ./packages/types

# Copy built files from builder
COPY --from=builder /app/backend/dist ./backend/dist

# Copy config directory (needed at runtime)
COPY --from=builder /app/config ./config

# Copy platform data directories (needed at runtime for recipient/subreddit data etc.)
# These are not compiled by TypeScript, so we copy from source
# Copy all platforms/src temporarily to extract data directories
COPY --from=builder /app/backend/src/platforms ./backend/src/platforms
# Copy all data directories for all platforms dynamically
RUN mkdir -p /app/backend/dist/platforms && \
    find /app/backend/src/platforms -type d -name "data" | while read dir; do \
      platform=$(echo "$dir" | sed 's|.*/platforms/\([^/]*\)/data|\1|'); \
      mkdir -p "/app/backend/dist/platforms/$platform" && \
      cp -r "$dir" "/app/backend/dist/platforms/$platform/data"; \
    done && \
    find /app/backend/src/platforms -type d -name "locales" | while read dir; do \
      platform=$(echo "$dir" | sed 's|.*/platforms/\([^/]*\)/locales|\1|'); \
      mkdir -p "/app/backend/dist/platforms/$platform" && \
      cp -r "$dir" "/app/backend/dist/platforms/$platform/locales"; \
    done && \
    rm -rf /app/backend/src

WORKDIR /app/backend

# ✅ Change ownership of app directory to non-root user
RUN chown -R nodeuser:nodeuser /app

# Expose port
EXPOSE 4000

# Set environment
ENV NODE_ENV=production
ENV PORT=4000

# ✅ Switch to non-root user
USER nodeuser

# Start server
CMD ["node", "dist/index.js"]

# Multi-stage build for Backend
# Build context is root directory
# Stage 1: Build
FROM node:20-alpine AS builder

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy root package.json and pnpm workspace config
COPY package*.json ./
COPY pnpm-workspace.yaml ./

# Copy backend package.json
COPY backend/package*.json ./backend/

# Install dependencies with pnpm (works better with workspaces)
# Include devDependencies for build tools like tsc
RUN pnpm install --frozen-lockfile || pnpm install

# Copy backend source code
COPY backend/ ./backend/

# Copy config directory
COPY config/ ./config/

# Build TypeScript (from root, using workspace filter)
# pnpm resolves binaries from root node_modules in workspace setup
WORKDIR /app
RUN pnpm --filter @eventpromoter/backend run build

# Stage 2: Production
FROM node:20-alpine

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy root package.json and pnpm workspace config
COPY package*.json ./
COPY pnpm-workspace.yaml ./

# Copy backend package.json
COPY backend/package*.json ./backend/

# Install dependencies with pnpm - need all for jsdom to work correctly
# jsdom has ES module dependencies that require full install
RUN pnpm install --prod=false

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
    rm -rf /app/backend/src

WORKDIR /app/backend

# Expose port
EXPOSE 4000

# Set environment
ENV NODE_ENV=production
ENV PORT=4000

# Start server
CMD ["node", "dist/index.js"]

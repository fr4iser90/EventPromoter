# Multi-stage build for Frontend
# Build context is root directory
# Stage 1: Build
FROM node:20-alpine AS builder

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files and pnpm workspace config
COPY package*.json ./
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY frontend/package*.json ./frontend/
COPY packages/types/package*.json ./packages/types/

# Copy frontend source code BEFORE installing dependencies
# This avoids conflicts with pnpm's symlinks in node_modules
COPY frontend/ ./frontend/
COPY packages/types/ ./packages/types/

# Install dependencies with pnpm (works better with workspaces)
# pnpm will create symlinks in frontend/node_modules pointing to root node_modules
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @eventpromoter/types run build

# Build with Vite
# pnpm handles workspace dependencies better than npm
WORKDIR /app/frontend
RUN pnpm run build

# Stage 2: Production (nginx)
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copy nginx configuration (for SPA routing, API proxying, and security headers)
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Create nginx cache directories and set proper permissions before switching to nginx user
RUN mkdir -p /var/cache/nginx/client_temp \
    /var/cache/nginx/proxy_temp \
    /var/cache/nginx/fastcgi_temp \
    /var/cache/nginx/uwsgi_temp \
    /var/cache/nginx/scgi_temp && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    chown nginx:nginx /etc/nginx/conf.d/default.conf && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

EXPOSE 80

USER nginx

CMD ["nginx", "-g", "daemon off;"]
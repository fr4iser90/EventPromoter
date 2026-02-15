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

# Copy nginx configuration (for SPA routing and API proxying)
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /api { \
        proxy_pass http://backend:4000/api; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

USER nginx

CMD ["nginx", "-g", "daemon off;"]

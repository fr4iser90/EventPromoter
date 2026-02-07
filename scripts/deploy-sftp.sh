#!/bin/bash

# SFTP Deployment Script
# Uploads only necessary files (excluding build data) to remote server

set -e  # Exit on error

# Configuration
REMOTE_USER="docker"
REMOTE_HOST="192.168.178.33"
REMOTE_PATH="/home/docker/docker/workspaces/Alex/EventPromoter"
LOCAL_PATH="."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if rsync is installed
if ! command -v rsync &> /dev/null; then
    echo -e "${RED}Error: rsync is not installed. Please install it first.${NC}"
    echo -e "${YELLOW}On Ubuntu/Debian: sudo apt-get install rsync${NC}"
    echo -e "${YELLOW}On macOS: rsync should be pre-installed${NC}"
    exit 1
fi

# Check for dry-run flag
DRY_RUN=""
if [[ "$1" == "--dry-run" ]] || [[ "$1" == "-n" ]]; then
    DRY_RUN="--dry-run"
    echo -e "${BLUE}Running in DRY-RUN mode (no files will be uploaded)${NC}"
fi

echo -e "${GREEN}Starting SFTP deployment...${NC}"
echo -e "${YELLOW}Target: ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}${NC}"

# Use rsync over SSH to sync files
# Exclude build directories and unnecessary files
rsync -avz --progress ${DRY_RUN} \
  --exclude='node_modules/' \
  --exclude='dist/' \
  --exclude='build/' \
  --exclude='.next/' \
  --exclude='.vite/' \
  --exclude='*.tsbuildinfo' \
  --exclude='.env' \
  --exclude='.env.local' \
  --exclude='.env.*.local' \
  --exclude='config/*' \
  --exclude='*.n8n' \
  --exclude='n8n-data/' \
  --exclude='n8n-credentials/' \
  --exclude='.vscode/' \
  --exclude='.idea/' \
  --exclude='*.swp' \
  --exclude='*.swo' \
  --exclude='*~' \
  --exclude='.DS_Store' \
  --exclude='logs/' \
  --exclude='*.log' \
  --exclude='coverage/' \
  --exclude='tmp/' \
  --exclude='temp/' \
  --exclude='.cache/' \
  --exclude='.parcel-cache/' \
  --exclude='.eslintcache' \
  --exclude='test-results/' \
  --exclude='playwright-report/' \
  --exclude='screenshots/' \
  --exclude='*.db' \
  --exclude='*.sqlite' \
  --exclude='*.sqlite3' \
  --exclude='test-data/' \
  --exclude='backend/events/*' \
  --exclude='.git/' \
  --exclude='.dockerignore' \
  --exclude='docker-compose.override.yml' \
  --exclude='pnpm-lock.yaml' \
  --exclude='docker-compose.yml' \
  --delete \
  "${LOCAL_PATH}/" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/"

echo -e "${GREEN}✓ Deployment completed successfully!${NC}"

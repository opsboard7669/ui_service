#!/bin/bash
set -e

echo "=========================================="
echo "  UI Service Starting..."
echo "=========================================="

echo "[1/2] Loading config from volume..."
export VITE_AUTH_SERVICE_URL=$(cat /app/config/VITE_AUTH_SERVICE_URL)
export VITE_USER_SERVICE_URL=$(cat /app/config/VITE_USER_SERVICE_URL)
export VITE_TASK_SERVICE_URL=$(cat /app/config/VITE_TASK_SERVICE_URL)
echo "[1/2] Config loaded successfully!"

echo "[2/2] Starting ui-service..."
exec node server.js
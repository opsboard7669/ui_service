#!/bin/bash
source ./build/common.env
set -e

echo "=========================================="
echo "  Auth Service — Build and Push"
echo "=========================================="

echo "[1/3] Logging into DockerHub..."
echo "$DOCKERHUB_PASSWORD" | docker login -u "$DOCKERHUB_USER" --password-stdin
echo "[1/3] Login successful!"

echo "[2/3] Building Docker image..."
docker build -t $DOCKERHUB_USER/$SERVICE_NAME:$VERSION .
echo "[2/3] Build complete!"

echo "[3/3] Pushing to DockerHub..."
docker push $DOCKERHUB_USER/$SERVICE_NAME:$VERSION
echo "[3/3] Push complete!"

echo "=========================================="
echo "  Pushed: $DOCKERHUB_USER/$SERVICE_NAME:$VERSION"
echo "=========================================="
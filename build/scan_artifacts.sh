#!/bin/bash
source ./build/common.env
set -e

echo "=========================================="
echo "  Auth Service — Trivy Scan"
echo "=========================================="

echo "[1/2] Pulling image from DockerHub..."
echo "$DOCKERHUB_PASSWORD" | docker login -u "$DOCKERHUB_USER" --password-stdin
docker pull $DOCKERHUB_USER/$SERVICE_NAME:$VERSION
echo "[1/2] Image pulled!"

echo "[2/2] Scanning image..."
trivy image \
  --severity HIGH,CRITICAL \
  --exit-code 0 \
  --format table \
  $DOCKERHUB_USER/$SERVICE_NAME:$VERSION
echo "[2/2] Scan complete!"

echo "=========================================="
echo "  Scan done: $DOCKERHUB_USER/$SERVICE_NAME:$VERSION"
echo "=========================================="
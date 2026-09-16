#!/bin/bash
source ./build/common.env
set -e

echo "ENV=$ENV"
echo "SERVICE_NAME=$SERVICE_NAME"
echo "VERSION=$VERSION"
echo "SUBNAMESPACE=$SUBNAMESPACE"
echo "IMAGE_NAME=$IMAGE_NAME"

echo "=========================================="
echo "  Auth Service — Helm Deploy"
echo "=========================================="

echo "[1/2] Deploying with Helm..."
helm upgrade --install $SERVICE_NAME ./helm \
  -f ./helm/values/values.yml \
  -f ./helm/values/values.$ENV.yml \
  --set image.repository=$IMAGE_NAME \
  --set image.tag=$VERSION \
  --namespace $SUBNAMESPACE \
  --timeout 5m
echo "[1/2] Helm deploy complete!"

echo "[2/2] Verifying deployment..."
kubectl rollout status deployment/$SERVICE_NAME -n $SUBNAMESPACE
echo "[2/2] Deployment verified!"

echo "=========================================="
echo "  Deployed: $SERVICE_NAME:$VERSION"
echo "  Namespace: $SUBNAMESPACE"
echo "=========================================="
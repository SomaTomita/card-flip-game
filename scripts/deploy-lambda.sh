#!/usr/bin/env bash
set -euo pipefail

# Deploy server code to AWS Lambda
# Usage: ./scripts/deploy-lambda.sh [function-name]

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SERVER_DIR="$PROJECT_ROOT/server"
DIST_DIR="$SERVER_DIR/dist"
ZIP_FILE="$PROJECT_ROOT/.tmp/lambda-package.zip"

FUNCTION_NAME="${1:-cardflip-dev-api}"
REGION="${AWS_REGION:-ap-northeast-1}"

echo "==> Building server..."
cd "$SERVER_DIR"
npm run build

echo "==> Packaging Lambda function..."
mkdir -p "$(dirname "$ZIP_FILE")"
rm -f "$ZIP_FILE"

# Include compiled JS
cd "$DIST_DIR"
zip -rq "$ZIP_FILE" .

# Include production node_modules only
cd "$SERVER_DIR"
cp package.json package-lock.json "$DIST_DIR/"
cd "$DIST_DIR"
npm ci --omit=dev --ignore-scripts
zip -rq "$ZIP_FILE" node_modules/
rm -rf node_modules package.json package-lock.json

echo "==> Deploying to Lambda: $FUNCTION_NAME (region: $REGION)..."
aws lambda update-function-code \
  --function-name "$FUNCTION_NAME" \
  --zip-file "fileb://$ZIP_FILE" \
  --region "$REGION" \
  --no-cli-pager

echo "==> Waiting for function update..."
aws lambda wait function-updated \
  --function-name "$FUNCTION_NAME" \
  --region "$REGION"

echo "==> Done! Lambda function '$FUNCTION_NAME' updated successfully."

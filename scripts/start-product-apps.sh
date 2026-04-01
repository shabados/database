#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PGPORT="${PRODUCT_PG_PORT:-54329}"
API_PORT="${API_PORT:-4100}"
WEB_PORT="${WEB_PORT:-3001}"

DATABASE_URL="${DATABASE_URL:-postgresql://postgres@127.0.0.1:${PGPORT}/giaankhand}"
TYPESENSE_HOST="${TYPESENSE_HOST:-127.0.0.1}"
TYPESENSE_PORT="${TYPESENSE_PORT:-8108}"
TYPESENSE_PROTOCOL="${TYPESENSE_PROTOCOL:-http}"
TYPESENSE_API_KEY="${TYPESENSE_API_KEY:-xyz}"
NEXT_PUBLIC_API_BASE_URL="${NEXT_PUBLIC_API_BASE_URL:-http://127.0.0.1:${API_PORT}}"

cd "${ROOT_DIR}"

nohup env \
  DATABASE_URL="${DATABASE_URL}" \
  TYPESENSE_HOST="${TYPESENSE_HOST}" \
  TYPESENSE_PORT="${TYPESENSE_PORT}" \
  TYPESENSE_PROTOCOL="${TYPESENSE_PROTOCOL}" \
  TYPESENSE_API_KEY="${TYPESENSE_API_KEY}" \
  API_PORT="${API_PORT}" \
  pnpm --filter @giaan-khand/api exec tsx src/server.ts \
  > "${ROOT_DIR}/.tmp/api.log" 2>&1 &

nohup env \
  NEXT_PUBLIC_API_BASE_URL="${NEXT_PUBLIC_API_BASE_URL}" \
  pnpm --filter @giaan-khand/web exec next dev -p "${WEB_PORT}" \
  > "${ROOT_DIR}/.tmp/web.log" 2>&1 &

echo "API starting on http://127.0.0.1:${API_PORT}"
echo "Web starting on http://127.0.0.1:${WEB_PORT}"

#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TOOLS_DIR="${ROOT_DIR}/.tmp/typesense"
DATA_DIR="${ROOT_DIR}/.tmp/typesense-data"
ARCHIVE_NAME="typesense-server-29.0-darwin-arm64.tar.gz"
ARCHIVE_URL="https://dl.typesense.org/releases/29.0/${ARCHIVE_NAME}"
PORT="${TYPESENSE_PORT:-8108}"
API_KEY="${TYPESENSE_API_KEY:-xyz}"

mkdir -p "${TOOLS_DIR}" "${DATA_DIR}"

if curl -sf "http://127.0.0.1:${PORT}/health" >/dev/null 2>&1; then
  echo "Typesense already running on port ${PORT}."
  exit 0
fi

if [ ! -x "${TOOLS_DIR}/typesense-server" ]; then
  curl -L "${ARCHIVE_URL}" -o "${TOOLS_DIR}/${ARCHIVE_NAME}"
  tar -xzf "${TOOLS_DIR}/${ARCHIVE_NAME}" -C "${TOOLS_DIR}"
fi

nohup "${TOOLS_DIR}/typesense-server" \
  --data-dir="${DATA_DIR}" \
  --api-key="${API_KEY}" \
  --listen-port="${PORT}" \
  --enable-cors \
  > "${ROOT_DIR}/.tmp/typesense.log" 2>&1 &

for _ in $(seq 1 30); do
  if curl -sf "http://127.0.0.1:${PORT}/health" >/dev/null 2>&1; then
    echo "Typesense started on port ${PORT}."
    exit 0
  fi
  sleep 1
done

echo "Typesense failed to start." >&2
exit 1

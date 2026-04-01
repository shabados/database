#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PGDATA_DIR="${ROOT_DIR}/.tmp/pgdata"
PGLOG_FILE="${ROOT_DIR}/.tmp/postgres.log"
PGPORT="${PRODUCT_PG_PORT:-54329}"

mkdir -p "${ROOT_DIR}/.tmp"

if [ ! -d "${PGDATA_DIR}/base" ]; then
  initdb -D "${PGDATA_DIR}" -A trust -U postgres >/dev/null
fi

if pg_isready -p "${PGPORT}" >/dev/null 2>&1; then
  echo "PostgreSQL already running on port ${PGPORT}."
  exit 0
fi

pg_ctl -D "${PGDATA_DIR}" -l "${PGLOG_FILE}" -o "-p ${PGPORT}" start
echo "PostgreSQL started on port ${PGPORT}."

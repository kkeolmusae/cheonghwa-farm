#!/usr/bin/env bash
# 컨테이너 쉘 접속
set -e
source "$(dirname "$0")/_common.sh"

usage() {
  echo "Usage: $0 [backend|frontend|admin|db]"
  echo "  (no args)  — 백엔드 bash"
  echo "  backend    — 백엔드 bash"
  echo "  frontend   — 프론트 sh"
  echo "  admin      — 관리자 sh"
  echo "  db         — PostgreSQL psql"
}

case "${1:-backend}" in
  backend)
    info "Connecting to backend..."
    docker compose exec backend bash
    ;;
  frontend)
    info "Connecting to frontend..."
    docker compose exec frontend sh
    ;;
  admin)
    info "Connecting to admin..."
    docker compose exec admin sh
    ;;
  db)
    info "Connecting to database..."
    docker compose exec db psql -U "${POSTGRES_USER:-farm}" "${POSTGRES_DB:-farm_db}"
    ;;
  help|--help|-h) usage ;;
  *) echo "Unknown: ${1}"; usage; exit 1 ;;
esac

#!/usr/bin/env bash
# DB 유틸리티 (초기화, psql 접속, 상태 확인)
set -e
source "$(dirname "$0")/_common.sh"

usage() {
  echo "Usage: $0 [command]"
  echo "  status  — 서비스 상태 확인"
  echo "  psql    — psql 직접 접속"
  echo "  reset   — DB 초기화 ⚠️  (모든 데이터 삭제)"
}

db_status() {
  docker compose ps
}

db_psql() {
  info "Connecting to psql..."
  docker compose exec db psql -U "${POSTGRES_USER:-farm}" "${POSTGRES_DB:-farm_db}"
}

db_reset() {
  warn "============================================"
  warn " DB를 초기화하면 모든 데이터가 삭제됩니다."
  warn "============================================"
  read -r -p "정말 초기화하시겠습니까? (yes 입력): " confirm
  [ "$confirm" != "yes" ] && { info "취소되었습니다."; exit 0; }

  info "Stopping backend..."
  docker compose stop backend

  info "Dropping database..."
  docker compose exec db psql -U "${POSTGRES_USER:-farm}" -c "DROP DATABASE IF EXISTS ${POSTGRES_DB:-farm_db};"
  docker compose exec db psql -U "${POSTGRES_USER:-farm}" -c "CREATE DATABASE ${POSTGRES_DB:-farm_db};"

  info "Starting backend..."
  docker compose start backend
  sleep 3

  info "Applying migrations..."
  docker compose exec backend alembic upgrade head
  success "DB reset complete."
}

case "${1:-}" in
  status)         db_status ;;
  psql)           db_psql ;;
  reset)          db_reset ;;
  ""|help|--help|-h) usage ;;
  *) echo "Unknown: ${1}"; usage; exit 1 ;;
esac

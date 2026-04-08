#!/usr/bin/env bash
# DB 마이그레이션 (Alembic)
set -e
source "$(dirname "$0")/_common.sh"

usage() {
  echo "Usage: $0 [command]"
  echo "  (no args)      — 마이그레이션 적용 (upgrade head)"
  echo "  up             — 마이그레이션 적용 (upgrade head)"
  echo "  down           — 1단계 롤백"
  echo "  status         — 현재 상태 및 히스토리 확인"
  echo "  make <message> — 새 마이그레이션 파일 생성"
}

case "${1:-}" in
  ""| up)
    info "Applying migrations (upgrade head)..."
    docker compose exec backend alembic upgrade head
    success "Migrations applied."
    ;;
  down)
    warn "Rolling back one revision..."
    docker compose exec backend alembic downgrade -1
    success "Rolled back."
    ;;
  status)
    info "Current revision:"
    docker compose exec backend alembic current
    echo ""
    info "History:"
    docker compose exec backend alembic history --verbose
    ;;
  make)
    [ -z "${2:-}" ] && error "Usage: $0 make <message>"
    info "Creating migration: ${2}"
    docker compose exec backend alembic revision --autogenerate -m "${2}"
    success "Migration file created."
    ;;
  help|--help|-h) usage ;;
  *) echo "Unknown: ${1}"; usage; exit 1 ;;
esac

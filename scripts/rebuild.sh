#!/usr/bin/env bash
# 이미지 재빌드 후 서비스 시작 (코드 변경 시 사용)
set -e
source "$(dirname "$0")/_common.sh"

usage() {
  echo "Usage: $0 [backend|frontend|admin]"
  echo "  (no args)  — 전체 재빌드"
  echo "  backend    — 백엔드만"
  echo "  frontend   — 프론트만"
  echo "  admin      — 관리자 페이지만"
}

rebuild() {
  local svc="${1:-}"
  if [ -z "$svc" ]; then
    info "Rebuilding all services..."
    docker compose build
    docker compose up -d
    success "All services rebuilt and started."
  else
    info "Rebuilding $svc..."
    docker compose build "$svc"
    docker compose up -d "$svc"
    success "$svc rebuilt and started."
  fi
}

case "${1:-}" in
  backend|frontend|admin) rebuild "$1" ;;
  "")                     rebuild ;;
  help|--help|-h)         usage ;;
  *) echo "Unknown: ${1}"; usage; exit 1 ;;
esac

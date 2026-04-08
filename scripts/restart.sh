#!/usr/bin/env bash
# 서비스 재시작
set -e
source "$(dirname "$0")/_common.sh"

usage() {
  echo "Usage: $0 [backend|frontend|admin]"
  echo "  (no args)  — 전체 재시작"
  echo "  backend    — 백엔드만"
  echo "  frontend   — 프론트만"
  echo "  admin      — 관리자 페이지만"
}

case "${1:-}" in
  backend)
    info "Restarting backend...";  docker compose restart backend;  success "Backend restarted."
    ;;
  frontend)
    info "Restarting frontend..."; docker compose restart frontend; success "Frontend restarted."
    ;;
  admin)
    info "Restarting admin...";    docker compose restart admin;    success "Admin restarted."
    ;;
  "")
    info "Restarting all services..."
    docker compose restart backend frontend admin
    success "All services restarted."
    ;;
  help|--help|-h) usage ;;
  *) echo "Unknown: ${1}"; usage; exit 1 ;;
esac

#!/usr/bin/env bash
set -e

# 프로젝트 루트로 이동 (스크립트 위치 기준)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

restart_backend() {
  echo "Restarting backend..."
  docker compose restart backend
  echo "Backend restarted."
}

restart_frontend() {
  echo "Restarting frontend..."
  docker compose restart frontend
  echo "Frontend restarted."
}

restart_admin() {
  echo "Restarting admin..."
  docker compose restart admin
  echo "Admin restarted."
}

case "${1:-}" in
  backend)
    restart_backend
    ;;
  frontend)
    restart_frontend
    ;;
  admin)
    restart_admin
    ;;
  "")
    restart_backend
    restart_frontend
    restart_admin
    echo "All services restarted."
    ;;
  *)
    echo "Usage: $0 [backend|frontend|admin]"
    echo "  no args   - restart backend, frontend and admin"
    echo "  backend   - restart backend only"
    echo "  frontend  - restart frontend only"
    echo "  admin     - restart admin only"
    exit 1
    ;;
esac

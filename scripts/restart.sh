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

case "${1:-}" in
  backend)
    restart_backend
    ;;
  frontend)
    restart_frontend
    ;;
  "")
    restart_backend
    restart_frontend
    echo "All services restarted."
    ;;
  *)
    echo "Usage: $0 [backend|frontend]"
    echo "  no args   - restart backend and frontend"
    echo "  backend   - restart backend only"
    echo "  frontend  - restart frontend only"
    exit 1
    ;;
esac

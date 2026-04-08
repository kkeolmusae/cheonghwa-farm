#!/usr/bin/env bash
# 서비스 로그 출력
set -e
source "$(dirname "$0")/_common.sh"

usage() {
  echo "Usage: $0 [backend|frontend|admin] [lines]"
  echo "  (no args)         — 전체 로그 (기본 50줄, follow)"
  echo "  backend [lines]   — 백엔드 로그"
  echo "  frontend [lines]  — 프론트 로그"
  echo "  admin [lines]     — 관리자 페이지 로그"
  echo ""
  echo "예시: $0 backend 100"
}

SVC="${1:-}"
LINES="${2:-50}"

case "$SVC" in
  backend|frontend|admin)
    docker compose logs --tail="$LINES" -f "$SVC"
    ;;
  "")
    docker compose logs --tail="$LINES" -f
    ;;
  help|--help|-h) usage ;;
  *) echo "Unknown: ${SVC}"; usage; exit 1 ;;
esac

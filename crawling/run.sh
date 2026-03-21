#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

if [[ ! -d .venv ]]; then
  echo "가상환경이 없습니다. 생성 후 의존성을 설치합니다..."
  python3 -m venv .venv
  .venv/bin/pip install -r requirements.txt
fi

.venv/bin/python3 kakao_story.py

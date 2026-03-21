# 카카오 스토리 크롤링

카카오 스토리 페이지에서 게시물을 수집해 마크다운과 이미지로 저장하는 스크립트입니다.

## 요구 사항

- **Python 3.9+**
- **Chrome 브라우저** (시스템에 설치되어 있어야 함)

## 설치 및 실행

**한 번에 실행 (권장)**

```bash
cd crawling
./run.sh
```

처음 실행 시 가상환경과 의존성이 자동으로 준비됩니다.

**수동 설치 후 실행**

```bash
# 1. crawling 폴더로 이동
cd crawling

# 2. 가상환경 생성 및 활성화 (권장)
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# 3. 의존성 설치
pip install -r requirements.txt

# 4. 스크립트 실행
python kakao_story.py
```

실행 후 브라우저가 열리면 해당 스토리 페이지로 이동해 자동으로 스크롤·수집이 진행됩니다. (공개 스토리는 로그인 없이 수집 가능)

## 결과

- `output/` 폴더 아래에 날짜별로 게시물이 저장됩니다.
- 각 날짜 폴더에 `README.md`(본문)와 이미지 파일이 들어갑니다.

## 설정 변경

- `kakao_story.py` 상단의 `BASE_URL`: 수집할 카카오 스토리 프로필 URL
- `OUTPUT_DIR`: 저장 경로 (기본 `output`)

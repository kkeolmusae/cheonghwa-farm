# 프로젝트 기술 스택 & 구조 문서

> 농장 온라인 쇼핑몰 — EC2/S3 배포 전 현황 파악용 참고 문서  
> 작성 기준: 2026-04-04

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택 요약](#2-기술-스택-요약)
3. [백엔드 상세](#3-백엔드-상세)
4. [프론트엔드](#4-프론트엔드)
5. [어드민](#5-어드민)
6. [Docker 환경](#6-docker-환경)
7. [운영 스크립트](#7-운영-스크립트)
8. [환경변수 목록](#8-환경변수-목록)
9. [EC2/S3 배포 시 변경 필요 항목](#9-ec2s3-배포-시-변경-필요-항목)

---

## 1. 프로젝트 개요

농장 상품 온라인 판매 플랫폼. 비회원 주문, 무통장 입금, SMS 알림을 기반으로 운영한다.

```
farm/
├── backend/         FastAPI 백엔드 (REST API)
├── frontend/        고객용 쇼핑몰 (React)
├── admin/           관리자 대시보드 (React)
├── crawling/        데이터 크롤링 (Selenium)
├── scripts/         운영 쉘 스크립트
├── docker-compose.yml
└── .env.example
```

**서비스 접근 포트 (개발 환경)**

| 서비스 | URL |
|--------|-----|
| 고객 쇼핑몰 | <http://localhost:5173> |
| 관리자 대시보드 | <http://localhost:5174> |
| API 서버 | <http://localhost:8000> |
| API 문서 (Swagger) | <http://localhost:8000/docs> |
| PostgreSQL | localhost:5432 |

---

## 2. 기술 스택 요약

| 레이어 | 기술 | 버전 |
|--------|------|------|
| **백엔드 프레임워크** | FastAPI | 0.115.6 |
| **ASGI 서버** | Uvicorn | 0.34.0 |
| **ORM** | SQLAlchemy (async) | 2.0.36 |
| **데이터베이스** | PostgreSQL | 16 |
| **DB 드라이버** | asyncpg | 0.30.0 |
| **마이그레이션** | Alembic | 1.14.1 |
| **데이터 검증** | Pydantic | 2.10.4 |
| **인증** | JWT (python-jose) | 3.3.0 |
| **비밀번호 해싱** | bcrypt (passlib) | 1.7.4 |
| **이미지 처리** | Pillow | 11.1.0 |
| **HTTP 클라이언트** | httpx | 0.28.1 |
| **파일 업로드** | python-multipart | 0.0.20 |
| **프론트엔드 프레임워크** | React | 18.3.1 |
| **언어** | TypeScript | 5.6.2 |
| **번들러** | Vite | 6.0.3 |
| **라우팅** | react-router-dom | 6.28.0 |
| **서버 상태 관리** | TanStack React Query | 5.62.0 |
| **전역 상태 관리** | Zustand | 5.0.2 |
| **HTTP 클라이언트 (FE)** | Axios | 1.7.9 |
| **스타일** | Tailwind CSS | 3.4.17 |
| **폼 관리 (어드민)** | react-hook-form | 7.54.0 |
| **스키마 검증 (어드민)** | Zod | 3.24.1 |
| **드래그앤드롭 (어드민)** | @dnd-kit | 6.3.0+ |
| **토스트 알림 (어드민)** | react-hot-toast | 2.4.1 |
| **아이콘** | lucide-react | 0.460.0 |
| **컨테이너화** | Docker + docker-compose | - |
| **SMS** | 알리고 (Aligo) API | - |

---

## 3. 백엔드 상세

### 3.1 디렉토리 구조

```
backend/
├── app/
│   ├── main.py                    # FastAPI 앱 진입점, lifespan
│   ├── core/
│   │   ├── config.py              # Pydantic Settings (환경변수 로드)
│   │   ├── database.py            # SQLAlchemy 비동기 엔진 & 세션
│   │   ├── security.py            # JWT 생성/검증, bcrypt 해싱
│   │   └── dependencies.py        # get_current_admin (DI)
│   ├── models/
│   │   ├── admin.py               # Admin
│   │   ├── category.py            # Category
│   │   ├── product.py             # Product, ProductOption, ProductImage
│   │   ├── order.py               # Order, OrderItem
│   │   ├── journal.py             # FarmJournal, JournalImage
│   │   ├── notice.py              # Notice
│   │   └── site_settings.py       # SiteSettings (싱글톤)
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── product.py
│   │   ├── order.py
│   │   ├── journal.py
│   │   ├── notice.py
│   │   ├── site_settings.py
│   │   └── common.py              # PaginatedResponse[T]
│   ├── api/v1/
│   │   ├── auth.py                # /auth
│   │   ├── products.py            # /products (공개)
│   │   ├── categories.py          # /categories (공개)
│   │   ├── journals.py            # /journals (공개)
│   │   ├── notices.py             # /notices (공개)
│   │   ├── orders.py              # /orders (공개)
│   │   ├── site_settings.py       # /site-settings (공개)
│   │   ├── uploads.py             # /uploads (관리자)
│   │   ├── admin_products.py      # /admin/products
│   │   ├── admin_categories.py    # /admin/categories
│   │   ├── admin_orders.py        # /admin/orders
│   │   ├── admin_journals.py      # /admin/journals
│   │   ├── admin_notices.py       # /admin/notices
│   │   └── admin_site_settings.py # /admin/site-settings
│   └── services/
│       ├── auth_service.py
│       ├── product_service.py
│       ├── category_service.py
│       ├── order_service.py
│       ├── journal_service.py
│       ├── notice_service.py
│       ├── site_settings_service.py
│       ├── upload_service.py
│       ├── sms_service.py
│       └── seed_service.py        # 앱 시작 시 기본 데이터 초기화
├── alembic/
│   └── versions/
│       ├── 471bee478bb7_initial_tables.py
│       ├── b8e2a1c0d4f3_site_settings.py
│       └── c3f1e2d9a4b7_orders_and_order_items.py
├── alembic.ini
├── requirements.txt
└── .env.example
```

### 3.2 데이터베이스 모델

**데이터베이스:** PostgreSQL 16  
**ORM:** SQLAlchemy 2.0 (비동기)  
**드라이버:** asyncpg  
**커넥션 풀:** pool_size=20, max_overflow=10

#### 테이블 관계도

```
categories (1) ──── (N) products
                         │
                         ├── (N) product_options
                         └── (N) product_images

orders (1) ──────── (N) order_items

farm_journals (1) ── (N) journal_images

admins (독립)
notices (독립)
site_settings (싱글톤, id=1)
```

#### 주요 테이블 필드

**admins**

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | Integer PK | - |
| email | String (unique) | 로그인 이메일 |
| password_hash | String | bcrypt 해시 |
| name | String | 표시 이름 |
| totp_secret | String (nullable) | 2FA 준비 |
| created_at | DateTime | - |

**products**

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | Integer PK | - |
| category_id | FK → categories | - |
| name | String | 상품명 |
| description | Text | 상품 설명 |
| status | String | "판매 예정" / "판매 중" / "품절" / "판매 종료" |
| harvest_start/end | Date | 수확 기간 |
| sale_start/end | Date | 판매 기간 |
| is_deleted | Boolean | 소프트 삭제 플래그 |
| created_at / updated_at | DateTime | - |

**product_options**

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | Integer PK | - |
| product_id | FK → products | - |
| name | String | 옵션명 (예: 1kg, 2kg) |
| price | Integer | 원 단위 |
| stock_quantity | Integer | 현재 재고 |
| stock_threshold | Integer | 재고 경고 임계값 |
| sort_order | Integer | 정렬 순서 |
| is_active | Boolean | 활성 여부 |

**orders**

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | Integer PK | - |
| order_number | String (unique) | 8자리 영숫자 (대문자+숫자) |
| customer_name | String | 주문자명 |
| customer_phone | String | 연락처 |
| customer_address | String | 배송 주소 |
| delivery_type | String | "택배" / "직거래" |
| delivery_note | String | 배송 메모 |
| status | String | pending → payment_pending → preparing → shipping → delivered |
| cancel_reason | String | 취소 사유 |
| tracking_number | String | 송장번호 |
| total_amount | Integer | 상품 합계 (배송비 제외) |
| delivery_fee | Integer | 배송비 |
| created_at / updated_at | DateTime | - |

**order_items**

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | Integer PK | - |
| order_id | FK → orders | - |
| product_id | Integer | 주문 시점 상품 ID (참조용) |
| option_id | Integer | 주문 시점 옵션 ID (참조용) |
| product_name | String | **스냅샷** — 주문 시점 상품명 |
| option_name | String | **스냅샷** — 주문 시점 옵션명 |
| quantity | Integer | 수량 |
| unit_price | Integer | 주문 시점 단가 |

### 3.3 API 엔드포인트

기본 경로: `/api/v1`

#### 공개 API (인증 불필요)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/auth/admin/login` | 관리자 로그인 → JWT 발급 |
| POST | `/auth/refresh` | refresh 토큰으로 갱신 |
| GET | `/categories` | 카테고리 목록 |
| GET | `/products` | 상품 목록 (판매 중, 페이지네이션, 카테고리 필터) |
| GET | `/products/{id}` | 상품 상세 |
| GET | `/journals` | 농장 일지 목록 |
| GET | `/journals/{id}` | 농장 일지 상세 |
| GET | `/notices` | 공지사항 목록 (고정글 우선) |
| GET | `/notices/{id}` | 공지사항 상세 |
| POST | `/orders` | 주문 생성 (비회원) |
| GET | `/orders/{order_number}` | 주문 조회 (주문번호 + 연락처) |
| GET | `/site-settings` | 사이트 배경 이미지 URL 조회 |

#### 관리자 API (JWT 필요)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/uploads` | 이미지 업로드 → WebP + 썸네일 생성 |
| GET | `/admin/products` | 전체 상품 목록 |
| GET | `/admin/products/{id}` | 상품 상세 (삭제된 포함) |
| POST | `/admin/products` | 상품 등록 |
| PUT | `/admin/products/{id}` | 상품 수정 |
| DELETE | `/admin/products/{id}` | 상품 삭제 (소프트) |
| PATCH | `/admin/products/{id}/status` | 상품 상태 변경 |
| GET/POST | `/admin/categories` | 카테고리 조회/생성 |
| PUT/DELETE | `/admin/categories/{id}` | 카테고리 수정/삭제 |
| GET | `/admin/orders` | 주문 목록 (status 필터) |
| GET | `/admin/orders/{id}` | 주문 상세 |
| POST | `/admin/orders/{id}/accept` | 주문 수락 (pending → payment_pending) |
| POST | `/admin/orders/{id}/harvest` | 수확 완료 (payment_pending → preparing) |
| POST | `/admin/orders/{id}/ship` | 배송 시작 (preparing → shipping, 송장번호 입력) |
| POST | `/admin/orders/{id}/cancel` | 주문 취소 (취소 사유, 재고 복구) |
| GET/POST | `/admin/journals` | 농장 일지 조회/작성 |
| PUT/DELETE | `/admin/journals/{id}` | 농장 일지 수정/삭제 |
| GET/POST | `/admin/notices` | 공지사항 조회/작성 |
| PUT/DELETE | `/admin/notices/{id}` | 공지사항 수정/삭제 |
| GET/PATCH | `/admin/site-settings` | 사이트 설정 조회/수정 |

### 3.4 인증 방식

**JWT Bearer 토큰 (Stateless)**

```
로그인 (POST /auth/admin/login)
  └── email + password 검증 (bcrypt)
       └── access_token (30분) + refresh_token (7일) 발급

관리자 API 요청
  └── Authorization: Bearer <access_token>
       └── get_current_admin() 의존성이 토큰 검증
            └── 토큰 타입 "access" 확인 필수

토큰 갱신 (POST /auth/refresh)
  └── refresh_token 전달 → 새 access + refresh 쌍 발급
```

- 알고리즘: HS256
- 토큰에는 `sub`(관리자 ID), `email`, `type`(access/refresh), `exp` 포함
- refresh 토큰으로 access 엔드포인트 접근 시 거부

### 3.5 비즈니스 로직

#### 주문 상태 전환

```
주문 생성 → pending
  └─[관리자 수락]→ payment_pending  (고객에게 입금 계좌 SMS)
       └─[수확 완료]→ preparing     (고객에게 배송 준비 SMS)
            └─[배송 시작]→ shipping  (고객에게 송장번호 SMS)
                 └─[완료]→ delivered

취소 가능 구간: pending / payment_pending
  → 취소 시 고객 SMS 발송 + 재고 복구
```

#### 배송비 정책

- 직거래: 0원
- 택배: 상품 합계 ≥ 30,000원 → 무료 / 미만 → 3,000원

#### 이미지 처리 (upload_service.py)

1. 원본 저장 전 최대 2048px로 리사이즈
2. WebP 포맷 변환 (품질 85)
3. 400×400 썸네일 자동 생성 (품질 80)
4. UUID 기반 파일명 (충돌 방지)
5. 반환: `{image_url, thumbnail_url}` (경로: `/uploads/...`)
6. 상품 이미지 최대 21장 제한 (is_primary 1장 + 서브 20장)

#### SMS 연동 (sms_service.py, 알리고 API)

- 엔드포인트: `https://apis.aligo.in/send/`
- SMS 발송 실패는 주문 처리에 영향 없음 (silent fail)
- 발송 시점: 새 주문 접수(관리자), 입금 안내, 배송 준비, 배송 시작, 주문 취소(고객)

### 3.6 Alembic 마이그레이션 현황

| 파일 | 내용 |
|------|------|
| `471bee478bb7` | 초기 테이블 (admins, categories, products, product_options, product_images, farm_journals, journal_images, notices) |
| `b8e2a1c0d4f3` | site_settings 추가 |
| `c3f1e2d9a4b7` | orders, order_items 추가 |

---

## 4. 프론트엔드

**역할:** 고객용 쇼핑몰 (포트 5173)

### 주요 라이브러리

| 라이브러리 | 용도 |
|------------|------|
| React 18 + TypeScript | UI 프레임워크 |
| Vite 6 | 번들러/개발 서버 |
| react-router-dom 6 | 페이지 라우팅 |
| TanStack React Query 5 | 서버 상태 캐싱 & 페칭 |
| Zustand 5 | 전역 상태 (장바구니 등) |
| Axios | API 통신 |
| Tailwind CSS 3 | 스타일 |
| lucide-react | 아이콘 |

### 페이지 구성

| 페이지 | 경로 | 설명 |
|--------|------|------|
| HomePage | `/` | 메인 (히어로, 스토리, 상품 소개) |
| ProductListPage | `/shop` | 상품 목록, 카테고리 필터 |
| ProductDetailPage | `/shop/:id` | 상품 상세, 옵션 선택 |
| AboutPage | `/about` | 농장 소개 |
| NoticeListPage | `/notices` | 공지사항 |
| JournalListPage | `/journal` | 농장 일지 |
| OrderStatusPage | `/order/:orderNumber` | 주문 조회 (주문번호 입력) |

---

## 5. 어드민

**역할:** 관리자 대시보드 (포트 5174)

### 프론트엔드 대비 추가 라이브러리

| 라이브러리 | 용도 |
|------------|------|
| react-hook-form 7 | 폼 상태 관리 |
| Zod + @hookform/resolvers | 스키마 기반 폼 검증 |
| @dnd-kit/core, sortable | 드래그앤드롭 (카테고리 정렬, 이미지 순서) |
| react-hot-toast | 토스트 알림 |

### 주요 페이지

| 페이지 | 기능 |
|--------|------|
| LoginPage | JWT 로그인 |
| DashboardPage | 주문 요약, 최근 활동 |
| ProductListPage | 상품 목록 (상태별 필터) |
| ProductFormPage | 상품 등록/수정 (이미지 업로드, 옵션 관리) |
| CategoryPage | 카테고리 CRUD + 드래그앤드롭 정렬 |
| OrderListPage | 주문 목록 (status 필터) |
| OrderDetailPage | 주문 상세, 상태 변경, 송장 등록 |
| NoticeListPage | 공지사항 CRUD |
| JournalFormPage | 농장 일지 작성/수정 |
| SiteImagesPage | 사이트 배경 이미지 관리 |

### 인증 흐름

1. 로그인 → JWT access/refresh 토큰을 localStorage에 저장 (authStore, Zustand)
2. axios 인터셉터가 모든 요청에 `Authorization: Bearer <token>` 자동 추가
3. 401 응답 시 refresh 토큰으로 갱신 시도 → 실패 시 로그인 페이지로 이동

---

## 6. Docker 환경

### 서비스 구성

| 서비스 | 이미지 | 포트 | 의존성 |
|--------|--------|------|--------|
| db | postgres:16 | 5432 | - |
| backend | ./backend/Dockerfile (python:3.11-slim) | 8000 | db (healthy) |
| frontend | ./frontend/Dockerfile (node:20-alpine) | 5173 | - |
| admin | ./admin/Dockerfile (node:20-alpine) | 5174 | - |

### 볼륨

| 볼륨 | 마운트 | 설명 |
|------|--------|------|
| postgres_data | db 컨테이너 내부 | DB 데이터 영속성 |
| backend_uploads | /app/uploads | 업로드 이미지 영속성 |
| ./backend | /app | 코드 핫리로드 (개발) |

### 개발 환경 시작

```bash
docker-compose up -d          # 전체 서비스 시작
./scripts/migrate.sh up       # 마이그레이션 적용 (최초 1회)
```

---

## 7. 운영 스크립트

**위치:** `scripts/`

### migrate.sh — Alembic 마이그레이션

```bash
./scripts/migrate.sh            # 최신 버전으로 업그레이드
./scripts/migrate.sh up         # 최신 버전으로 업그레이드
./scripts/migrate.sh down       # 1단계 롤백
./scripts/migrate.sh status     # 현재 상태 및 히스토리 확인
./scripts/migrate.sh make "메시지"  # 새 마이그레이션 파일 생성
```

### db.sh — 데이터베이스 유틸

```bash
./scripts/db.sh status          # 서비스 상태 확인
./scripts/db.sh psql            # psql 직접 접속
./scripts/db.sh reset           # DB 초기화 (주의: 데이터 삭제)
```

### rebuild.sh — 이미지 재빌드

```bash
./scripts/rebuild.sh            # 전체 재빌드
./scripts/rebuild.sh backend    # 백엔드만
./scripts/rebuild.sh frontend   # 프론트엔드만
./scripts/rebuild.sh admin      # 어드민만
```

### 기타

```bash
./scripts/restart.sh            # 서비스 재시작
./scripts/logs.sh               # 로그 조회
./scripts/shell.sh              # 컨테이너 쉘 접속
```

---

## 8. 환경변수 목록

`.env.example` 기준. `.env`로 복사 후 실제 값 입력.

```env
# 데이터베이스
DATABASE_URL=postgresql+asyncpg://farm:farm_secret@db:5432/farm_db
POSTGRES_USER=farm
POSTGRES_PASSWORD=farm_secret
POSTGRES_DB=farm_db

# JWT
SECRET_KEY=super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS (쉼표 구분, 프로토콜 포함)
BACKEND_CORS_ORIGINS=http://localhost:5173,http://localhost:5174

# 파일 업로드
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760   # 10MB

# 관리자 초기 계정 (앱 시작 시 자동 생성)
ADMIN_EMAIL=admin@farm.example.com
ADMIN_PASSWORD=admin1234
ADMIN_NAME=농장관리자

# SMS (알리고)
ALIGO_API_KEY=
ALIGO_USER_ID=
ALIGO_SENDER=             # 발신 번호
ADMIN_PHONE=              # 관리자 수신 번호 (새 주문 알림)

# 무통장 입금 안내
BANK_ACCOUNT=농협 716-12-338141
BANK_HOLDER=
```

---

## 9. EC2/S3 배포 시 변경 필요 항목

### 필수 변경

| 항목 | 현재 (개발) | 프로덕션 |
|------|------------|----------|
| `SECRET_KEY` | 기본값 | 랜덤 생성 강력한 키 |
| `ADMIN_PASSWORD` | admin1234 | 강력한 비밀번호 |
| `DATABASE_URL` | docker 내부 host | RDS 또는 EC2 내 PostgreSQL 주소 |
| `BACKEND_CORS_ORIGINS` | localhost:5173,5174 | 실제 도메인 (https 포함) |
| `ALIGO_*` 설정 | 비어 있음 | 알리고 계정 정보 입력 |
| `BANK_ACCOUNT`, `BANK_HOLDER` | 테스트 계좌 | 실제 계좌 |

### S3 연동 시 추가 구현 필요

현재 이미지 업로드는 **로컬 파일시스템**(`/app/uploads`)에 저장된다.  
S3 연동 시 `upload_service.py`를 수정하여 boto3로 S3에 업로드하고 CDN URL을 반환하도록 변경해야 한다.

```
현재: /uploads/xxx.webp (로컬 파일, Docker 볼륨)
변경: https://<bucket>.s3.<region>.amazonaws.com/xxx.webp
```

**변경이 필요한 파일:**

- `backend/app/services/upload_service.py` — S3 업로드 로직 추가
- `backend/app/core/config.py` — AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME, AWS_REGION 추가
- `backend/requirements.txt` — `boto3` 추가

**이미지 URL 제공 방식 변경:**

- 현재: FastAPI `/uploads/{filename}` 정적 파일 서빙
- 변경: S3 직접 URL 또는 CloudFront CDN URL

### 프로덕션 환경 추가 고려사항

- **Nginx 리버스 프록시**: 포트 80/443 → 백엔드(8000), 프론트엔드(5173), 어드민(5174) 라우팅
- **HTTPS**: SSL 인증서 (Let's Encrypt 또는 ACM)
- **Uvicorn 워커 수**: `--workers 4` 등 멀티 워커 설정 (현재 개발 모드 `--reload`)
- **로그 설정**: 파일 로깅 또는 CloudWatch 연동
- **DB 백업**: RDS 자동 백업 또는 pg_dump 스케줄
- **환경 분리**: `.env.production` 별도 관리
- **Vite 빌드**: 개발 서버(`npm run dev`) 대신 `npm run build` + 정적 파일 서빙 (Nginx)

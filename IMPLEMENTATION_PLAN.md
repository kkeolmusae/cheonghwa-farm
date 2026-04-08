# 농장 직판 쇼핑몰 — 추가 개발 체크리스트

> 에이전트들이 구현할 때마다 `- [ ]` → `- [x]`로 업데이트

---

## Phase 1. 배포 전 필수 (Critical)

### 백엔드

- [x] **BE-1** `Order` 모델에 `expires_at` 필드 추가 + Alembic 마이그레이션
  - `backend/app/models/order.py`에 `expires_at: DateTime nullable` 추가
  - `backend/alembic/versions/` 새 마이그레이션 파일 생성

- [x] **BE-2** `config.py`에 누락된 환경변수 추가
  - `PAYMENT_DEADLINE_HOURS: int = 48` (미입금 자동취소 기한)
  - `JEJU_ADDITIONAL_FEE: int = 3000`
  - `REMOTE_AREA_ADDITIONAL_FEE: int = 5000`

- [x] **BE-3** `OrderCreateResponse`에 은행 정보 + 입금기한 포함
  - `order_service.py` 주문 생성 시 `expires_at = now + PAYMENT_DEADLINE_HOURS`
  - `schemas/order.py` OrderResponse에 `bank_account`, `bank_holder`, `expires_at` 추가

- [x] **BE-4** 제주/도서산간 배송비 로직 구현
  - `order_service.py`에서 `customer_address`로 제주/도서산간 판별
  - 배송비 = 기본료 + 추가료 (제주 +3,000 / 도서산간 +5,000)
  - `OrderCreate` 스키마에 이를 반영

- [x] **BE-5** SMS에 입금기한 텍스트 추가
  - `sms_service.py`의 `notify_customer_payment_pending` 메시지에 `expires_at` 날짜 포함

- [x] **BE-6** 미입금 자동 취소 스케줄러 구현
  - `requirements.txt`에 `apscheduler` 추가
  - `backend/app/services/scheduler_service.py` 생성
  - 매 시간 실행: `expires_at < now AND status == payment_pending` → `cancelled`로 변경 + 재고 복구 + 고객 SMS
  - `main.py` lifespan에 스케줄러 시작/종료 연결

### 프론트엔드

- [x] **FE-1** 주문 완료 화면에 계좌번호 + 입금기한 표시
  - `frontend/src/components/order/OrderModal.tsx`의 `OrderCompleteView`
  - API 응답의 `bank_account`, `bank_holder`, `expires_at` 사용
  - "입금 기한: N월 N일까지" 표시

- [x] **FE-2** 주소 입력 개선 + 제주/도서산간 배송비 자동 계산
  - `react-daum-postcode` 라이브러리 추가 (`frontend/package.json`)
  - `OrderModal.tsx` 주소 필드를 Daum 우편번호 API로 교체
  - 주소 입력 후 제주/도서산간 여부 판별 → 배송비 실시간 업데이트

- [x] **FE-3** 헤더에 "주문 조회" 링크 추가
  - `frontend/src/components/layout/Header.tsx` (또는 모바일 메뉴)
  - `/order/status` 경로로 링크

---

## Phase 2. 빠른 시일 내 (Important)

### 프론트엔드

- [ ] **FE-4** 장바구니 기능 구현
  - `frontend/src/store/cartStore.ts` — Zustand + localStorage 기반
  - 상품 상세에서 "장바구니 담기" 버튼 추가
  - `/cart` 페이지 생성 — 담긴 상품 목록 + 수량 조절 + 전체 주문하기
  - `App.tsx` 라우팅 추가
  - `OrderModal.tsx` 다중 상품 items 배열 지원 (이미 API는 지원함)

- [ ] **FE-5** 체크아웃을 모달에서 별도 페이지로 분리 (모바일 UX 개선)
  - `/checkout` 페이지 생성
  - `OrderModal.tsx` 역할을 `CheckoutPage`로 이동
  - 장바구니 → 체크아웃 페이지 흐름으로 전환

---

## 구현 메모

- 각 항목 구현 완료 시 이 파일의 `- [ ]`를 `- [x]`로 변경
- BE 항목은 백엔드 에이전트, FE 항목은 프론트엔드 에이전트가 담당
- Phase 1을 모두 완료한 후 EC2 배포 진행
- Phase 2는 배포 후 운영하면서 추가

# 주문 기능 구현 기획서

## 개요

PG 결제 없이 **무통장 입금 기반**으로 운영하는 주문 시스템.
수수료 없음, 즉시 입금, 재고 상황에 따른 유연한 수락/거절이 핵심.

- 비회원 주문 (소셜 로그인 없이 이름/연락처/주소로 주문)
- SMS 문자 알림 (알리고 API)
- 주문 폼은 상품 상세 페이지 위 모달로 표시
- `수확` 상태는 고객에게도 "배송 준비 중"으로 노출

---

## 주문 흐름

```
고객: 주문하기 버튼 클릭
       ↓
  [모달] 이름 / 연락처 / 주소 / 배송방식 / 요청사항 입력
       ↓
서버: 주문 저장 (상태: 요청 접수)
아빠: SMS 수신 → "새 주문: {이름} {상품명} {금액}"
       ↓
관리자 페이지: [수락] 또는 [취소]
       ↓                     ↓
상태: 입금 대기            상태: 취소
고객 SMS:                  고객 SMS:
계좌번호 + 금액 안내        취소 사유 안내
       ↓
고객: 무통장 입금
       ↓
관리자: [수확] 버튼 클릭 (= 입금 확인 + 수확 시작)
       ↓
상태: 수확 중
고객 SMS: "배송 준비 중입니다"
       ↓
관리자: 포장/택배 완료 → 송장번호 입력 → [배송] 버튼
       ↓
상태: 배송 중
고객 SMS: "배송이 시작되었습니다. 송장번호: XXXX"
       ↓
관리자: [배송 완료] 클릭
상태: 배송 완료
```

---

## 주문 상태

| 상태 | 코드 | 설명 | 고객에게 표시 |
|------|------|------|--------------|
| 요청 접수 | `pending` | 주문 제출됨 | 주문 접수됨 |
| 입금 대기 | `payment_pending` | 수락 완료, 계좌 안내 발송 | 입금 대기 중 |
| 수확 중 | `preparing` | 입금 확인 + 수확/포장 중 | 배송 준비 중 |
| 배송 중 | `shipping` | 송장 입력 후 발송됨 | 배송 중 |
| 배송 완료 | `delivered` | 배송 완료 | 배송 완료 |
| 취소 | `cancelled` | 취소됨 (사유 포함) | 주문 취소됨 |

### 관리자 버튼 (상태별)

| 현재 상태 | 가능한 액션 |
|-----------|------------|
| 요청 접수 | [수락] [취소] |
| 입금 대기 | [수확] [취소] |
| 수확 중 | [배송] (송장번호 입력) |
| 배송 중 | [배송 완료] |

---

## SMS 발송 시점

| 시점 | 수신자 | 내용 |
|------|--------|------|
| 주문 접수 | 아빠 | "새 주문이 들어왔습니다. {이름} / {상품} / {금액}" |
| 수락 후 | 고객 | 계좌번호 + 입금 금액 + 예금주 안내 |
| 수확 시작 | 고객 | "주문하신 상품을 배송 준비 중입니다" |
| 배송 시작 | 고객 | "배송이 시작됐습니다. 송장번호: {번호}" |
| 취소 | 고객 | "주문이 취소되었습니다. 사유: {사유}" |

---

## 구현 범위

### Phase 1 — 백엔드

**새 파일:**
- `backend/app/models/order.py` — Order, OrderItem 모델
- `backend/app/schemas/order.py` — 요청/응답 스키마
- `backend/app/services/order_service.py` — 주문 생성, 상태 변경, 재고 차감 로직
- `backend/app/services/sms_service.py` — 알리고 SMS API 연동
- `backend/app/api/v1/orders.py` — 고객용 (주문 생성, 비회원 조회)
- `backend/app/api/v1/admin_orders.py` — 관리자용 (목록, 상태 변경)
- `backend/alembic/versions/xxx_add_orders.py` — 마이그레이션

**수정 파일:**
- `backend/app/api/v1/__init__.py` — 새 라우터 등록
- `backend/app/core/config.py` — SMS 환경변수 추가
- `.env.example` — 알리고 관련 키 추가

**Order 모델:**
```
Order: id, order_number(8자리 코드), customer_name, customer_phone,
       customer_address, delivery_type, delivery_note,
       status, cancel_reason, tracking_number,
       total_amount, delivery_fee, created_at, updated_at

OrderItem: id, order_id(FK), product_id, option_id,
           product_name, option_name (주문 시점 스냅샷),
           quantity, unit_price
```

**API 엔드포인트:**
```
POST   /api/v1/orders                            고객: 주문 생성
GET    /api/v1/orders/{order_number}?phone=xxx   고객: 주문 조회

GET    /api/v1/admin/orders                      관리자: 목록
GET    /api/v1/admin/orders/{id}                 관리자: 상세
POST   /api/v1/admin/orders/{id}/accept          수락
POST   /api/v1/admin/orders/{id}/harvest         수확 시작
POST   /api/v1/admin/orders/{id}/ship            배송 (tracking_number 포함)
POST   /api/v1/admin/orders/{id}/complete        배송 완료
POST   /api/v1/admin/orders/{id}/cancel          취소 (cancel_reason 포함)
```

**재고 차감 로직:**
- 수락 시 → `ProductOption.stock_quantity -= quantity`
- 전 옵션 재고 0 → `Product.status = '품절'` 자동 전환
- 취소 시 → 재고 복구 (배송 중/완료 상태는 복구 불가)

---

### Phase 2 — 프론트엔드 (주문 모달)

**새 파일:**
- `frontend/src/components/order/OrderModal.tsx` — 주문 입력 폼
- `frontend/src/components/order/OrderSuccess.tsx` — 완료 화면 (주문번호 표시)
- `frontend/src/api/orders.ts` — 주문 생성 API 호출
- `frontend/src/types/order.ts` — 주문 타입 정의
- `frontend/src/pages/OrderStatusPage/index.tsx` — 비회원 주문 조회

**수정 파일:**
- `frontend/src/pages/ProductDetailPage/index.tsx` — 버튼 onClick 연결
- `frontend/src/App.tsx` — `/order/status` 라우트 추가

**OrderModal 폼 항목:**
- 이름 (필수)
- 연락처 (필수, 휴대폰 형식 검증)
- 주소 (필수, 카카오 우편번호 API)
- 배송 방식 (택배 / 직거래)
- 배송 요청사항 (선택)
- 주문 요약: 상품명, 옵션, 수량, 배송비, 합계

---

### Phase 3 — 관리자 페이지 (주문 관리)

**새 파일:**
- `admin/src/pages/OrderListPage/index.tsx` — 주문 목록 (상태 필터, 날짜 검색)
- `admin/src/pages/OrderDetailPage/index.tsx` — 주문 상세 + 상태 변경 버튼
- `admin/src/api/orders.ts` — 관리자 주문 API 호출
- `admin/src/types/order.ts` — 주문 타입

**수정 파일:**
- `admin/src/App.tsx` — `/orders`, `/orders/:id` 라우트 추가
- `admin/src/components/layout/AdminLayout.tsx` — 사이드바 주문 메뉴 추가
- `admin/src/pages/DashboardPage/index.tsx` — 미처리 주문 건수 위젯

---

### Phase 4 — 비회원 주문 조회 (선택)

`/order/status` 페이지에서 주문번호 + 연락처 입력 → 주문 상태 타임라인 표시.
고객이 SMS를 잃어버려도 직접 확인 가능.

---

## 환경변수 추가

```env
# SMS (알리고 https://smartsms.aligo.in)
ALIGO_API_KEY=
ALIGO_USER_ID=
ALIGO_SENDER=        # 사전 등록된 발신번호
ADMIN_PHONE=         # 아빠 핸드폰 번호 (주문 알림 수신)
```

---

## 구현 우선순위

1. **Phase 1** (백엔드) — 모델/API/SMS 기반 먼저
2. **Phase 2** (프론트 모달) — 핵심 고객 경험
3. **Phase 3** (관리자 주문 관리) — 아빠가 실제로 쓰는 기능
4. **Phase 4** (주문 조회) — 이후 추가 가능

---

## 검증 방법

1. Swagger UI(`/docs`)에서 주문 생성 → 수락 → 수확 → 배송 흐름 수동 확인
2. 알리고 테스트 모드(`test=1`)로 SMS API 연동 검증
3. 상품 상세 페이지 → 주문하기 → 모달 표시 → 폼 제출 → 주문번호 확인
4. 관리자 페이지 → 주문 목록 → 수락 버튼 → 상태 변경 확인
